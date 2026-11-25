# Sudoku — analiza stanu aplikacji i rekomendacja

## Kontekst

Projekt: Sudoku (vanilla JS + SCSS → Vue 3 + TS + Vite + Pinia + Vuetify, stan z brancha `develop` po merge `feature/vue-app-migration`, listopad 2026).
Cel produktu: responsywna gra (desktop + telefon), kilka poziomów trudności, dużo różnych plansz, motywy.
Prośba: rzetelna ocena kodu/architektury/funkcjonalności + decyzja „przepisać od zera czy kontynuować”.

Co zrobiłem: przeczytałem cały kod `src/` i porównałem z `_old/`, uruchomiłem `vue-tsc`, napisałem skrypt
sprawdzający bank łamigłówek (zgodność z rozwiązaniem, unikalność rozwiązania, liczba podpowiedzi).

---

## 1. Stan faktyczny w liczbach

- Realnej logiki jest ~400 linii (bez danych i scaffoldu). Gra = 6 komponentów + 1 store.
- Bank: **100 łamigłówek** (20 na poziom), wpisanych na sztywno w `src/store.ts`.
- **`npm run build` nie przechodzi** — błąd typu w `NumberContainer.vue:3` (`index.toString()` to `string`, a prop oczekuje `Cell['value']`).
- Testy: tylko scaffoldowy `HelloWorld.spec.ts`.

## 2. Mocne strony (rzeczywiste)

- **Dane łamigłówek są poprawne**: każda z 100 zgadza się ze swoim rozwiązaniem i ma **dokładnie jedno rozwiązanie** (sprawdzone solverem), brak duplikatów. To jedyny element warty przeniesienia 1:1.
- Sensowny stack: Vue 3 `<script setup>`, TS, Pinia setup store, lazy-loaded trasy, ESLint + Prettier.
- Przepływ gry jest prosty i czytelny (NewGame → Game?mode=new/resume → wygrana → dialog).
- Pauza przez `onUnmounted` + timer w store — prosty pomysł, który działa.
- Stara wersja miała przemyślany SCSS (architektura 7-1, responsywne `font-size` na `html`) — dobre źródło wzorców wizualnych.

## 3. Błędy funkcjonalne (to po prostu nie działa jak powinno)

1. **Build się wywala** (błąd TS, j.w.).
2. **Responsywność jest zepsuta, nie „niedokończona”.** Stara apka ustawiała `html { font-size: 62.5% }` (1rem = 10px) i skalowała to breakpointami. W Vue tego nie ma (`base.css` ma `font-size: 15px` na `body`), więc 1rem = 16px: komórka `6rem` = 96px → plansza ~870px szerokości, numpad 560px, toolbar `padding: 5rem 10rem`. Na telefonie gra jest niegrywalna, na małym laptopie też ciasno. Mixin `respond()` jest zakomentowany, a style „mobilne” zostały wpisane na stałe.
3. **Odświeżenie strony = utrata gry.** Brak jakiejkolwiek persystencji; `/game?mode=new` po F5 renderuje pustą planszę (`initialBoard === ''`).
4. **„Resume a Game” jest zawsze widoczne** (`const gameStarted = true` w `HomeView.vue`) — bez rozpoczętej gry pokazuje pustą planszę.
5. **Resume po wygranej wznawia timer** na rozwiązanej, zablokowanej planszy.
6. **Przycisk „restart” (`mdi-restore`) robi to samo co „wstecz”** — nawiguje na `/`.
7. Klikanie: drugie kliknięcie tej samej komórki tylko ją „odznacza” zamiast wpisać cyfrę; kliknięcie pustej komórki bez wybranej cyfry ustawia `highlightedValue = ''`, co nadaje klasę `highlighted` wszystkim pustym komórkom (niewidoczne, ale świadczy o modelu stanu).
8. `EndGameDialog`: „1 minutes”, „1 hours”; brak akcji typu „nowa gra / do menu”.
9. Strona główna to wciąż scaffold Vite: `HelloWorld` z tekstem „You've successfully created a project with Vite + Vue 3. What's next?”.
10. Footer: „© 2022” i link do repo `sudoku-js`.

## 4. Braki funkcjonalne względem tego, czym ma być gra sudoku

Brakuje rzeczy, które dziś są standardem w każdej aplikacji sudoku i które **determinują architekturę**:
- **notatki (pencil marks)** — bez nich trudne poziomy są w praktyce niegrywalne,
- **undo/redo**,
- **sygnalizacja konfliktów/błędów** (choćby opcjonalna),
- **obsługa klawiatury** (strzałki, 1–9, Backspace) i tryb „najpierw komórka, potem cyfra” (teraz działa tylko „najpierw cyfra”),
- podświetlanie wiersza/kolumny/bloku zaznaczonej komórki, licznik pozostałych cyfr,
- motywy — **nie istnieją**; jest wymuszony ciemny motyw Vuetify + jasno/ciemne zmienne ze scaffoldu (`prefers-color-scheme`) + zahardkodowane kolory w SCSS. Trzy niezależne systemy kolorów, które się gryzą.

## 5. Różnorodność plansz i poziomy trudności — największa słabość koncepcyjna

- 20 plansz na poziom → po ~20 grach zaczynają się powtórki (a losowanie bez historii powtarza wcześniej).
- **Trudność jest mierzona tylko liczbą podpowiedzi, i to niespójnie**: beginner 57, easy 43–44, medium 33–35, **hard 23–31, master 22–32 (średnio identycznie: 25,8)**. „Master” nie jest trudniejszy od „hard”. Liczba podpowiedzi słabo koreluje z realną trudnością — decydują techniki potrzebne do rozwiązania.
- Dane siedzą w reaktywnym `ref` w store (niepotrzebny koszt reaktywności i bundle).

## 6. Architektura i jakość kodu

- **Logika gry w komponentach widoku**: wykrywanie wygranej w `SudokuCell`, budowanie planszy w `GameView`, losowanie w `NewGameView`. Nie ma warstwy domenowej, której dałoby się przetestować bez DOM.
- **Store = „god object”**: bank danych + stan planszy + stan UI zaznaczeń + timer + stan modala.
- Model danych jest przypadkowy: `Cell['value']` miesza `''`, `'-'` i `'X'` (akcja UI „wymaż” jako wartość komórki), `selectedCell` jako **string** z indeksem, porównanie planszy przez `join('')` stringów.
- **Funkcje przekazywane jako propsy** (`getCellValue`, `selectCell`) — wzorzec z Reacta; w Vue idiomatyczne są `emit` albo bezpośrednio akcje store’u. Do tego komórka i tak czyta store bezpośrednio — dwa kanały dla tych samych danych.
- `<table>` z `display: flex` na każdym poziomie — traci semantykę tabeli, a nie zyskuje gridu; komórki to `div`y z `@click` (brak focusu, klawiatury, ARIA).
- Timer liczy ticki `setInterval` zamiast mierzyć czas od znacznika — dryf, brak pauzy przy ukryciu karty.
- **Vuetify**: importowane *wszystkie* komponenty i dyrektywy (`vuetify.ts`), a używane są 4–5 (btn-toggle, btn, dialog, card, icon). `v-responsive` owija `v-app` (powinno być odwrotnie), inline style w `App.vue`. Dla gry z własnymi motywami Vuetify bardziej przeszkadza niż pomaga.
- Martwy kod/scaffold: `HelloWorld`, `icons/*`, `logo.svg`, `sprite.svg`, zakomentowane zmienne SCSS i `console.log` w niezacommitowanej zmianie.
- Zależności z połowy 2024: ESLint 8 (legacy config, EOL), Vite 5, Vitest 1, TS 5.4 — upgrade i tak byłby potrzebny.

## 7. Werdykt: przepisać czy kontynuować?

**Przepisać od zera, w tym samym repo (nowy branch), zostając przy Vue 3 + TS + Vite + Pinia.**

Uzasadnienie:
- Kodu jest tak mało, że „kontynuacja” niczego nie oszczędza — a każda brakująca funkcja (notatki, undo, persystencja, klawiatura, motywy, generator) wymaga innego modelu danych niż obecny. Refaktor dotknąłby 100% plików.
- Do ocalenia: **bank 100 łamigłówek** (jako dane seedowe/fallback), kolorystyka i układ ze starego SCSS, ogólny przepływ ekranów.
- Zmiana frameworka nie jest potrzebna — Vue jest tu w pełni wystarczający i go znasz.
- **Vuetify — rekomenduję usunąć.** Gra potrzebuje 3–4 prostych kontrolek i pełnej kontroli nad wyglądem dla motywów; własne komponenty + CSS custom properties będą prostsze i lżejsze. (Jeśli wolisz Material look w menu — da się zostawić z `vite-plugin-vuetify` dla tree-shakingu, ale to kompromis.)

## 8. Jak ja bym to zbudował

### 8.1 Warstwa domenowa — `src/engine/` (czysty TS, zero Vue, pokryty testami)
- `board.ts` — plansza jako `Uint8Array(81)` (0 = puste), maska podpowiedzi, notatki jako bitmaska 9 bitów na komórkę; helpery wiersz/kolumna/blok, `findConflicts()`.
- `solver.ts` — szybki solver bitmaskowy z liczeniem rozwiązań (stop po 2) → weryfikacja unikalności.
- `generator.ts` — losowa pełna siatka → usuwanie komórek (z symetrią) dopóki rozwiązanie jest unikalne.
- `grader.ts` — **solver „ludzki”** z technikami (naked/hidden single, pairs/triples, pointing/box-line, X-Wing, …); poziom = najtrudniejsza technika potrzebna + liczba kroków. To realnie odróżnia hard od master.
- `transform.ts` — **transformacje zachowujące trudność**: permutacja cyfr (9!), zamiany wierszy w pasmach i pasm, kolumn i stosów, transpozycja. Z jednej łamigłówki powstają miliardy wizualnie różnych — natychmiastowy sposób na różnorodność przy istniejących 100 planszach, nawet przed generatorem.
- `rng.ts` — PRNG z seedem (np. mulberry32) → powtarzalne gry, „łamigłówka dnia”, możliwość udostępnienia seeda.
- Generowanie trudnych plansz w **Web Workerze** (może trwać setki ms); fallback = przetransformowana plansza z banku.

### 8.2 Stan — Pinia, rozbity wg odpowiedzialności
- `useGameStore`: plansza, notatki, podpowiedzi, historia undo/redo (lista ruchów), zaznaczenie (`number | null`), tryb notatek, status (`playing | paused | won`), czas jako `elapsedMs + startedAt`.
- `useSettingsStore`: motyw, pokazywanie błędów, podświetlenia, auto-usuwanie notatek.
- `useStatsStore`: wyniki per poziom (najlepszy/średni czas, liczba gier, seria).
- Persystencja w `localStorage` (własny `watch` lub `pinia-plugin-persistedstate`) → resume działa też po F5 i zamknięciu przeglądarki; „Resume” widoczne tylko gdy istnieje gra w toku.

### 8.3 UI
- Plansza jako **CSS Grid 9×9**, rozmiar `min(94vw, 70dvh)` + `aspect-ratio: 1`, font w `cqi` (container queries) — skaluje się płynnie od telefonu do monitora.
- Układ: numpad obok planszy na szerokim ekranie, pod planszą na wąskim; przyciski min. 44px (dotyk).
- Wejście: komórka-najpierw **i** cyfra-najpierw, pełna klawiatura, przełącznik notatek, undo, erase.
- Komórki jako `button`/`role="gridcell"` z roving tabindex — dostępność za darmo przy okazji obsługi klawiatury.
- **Motywy przez CSS custom properties** na `[data-theme="…"]` (np. light, dark, sepia/paper, high-contrast); domyślny wg `prefers-color-scheme`. Jeden system kolorów zamiast trzech.
- Ekrany: Home (Kontynuuj / Nowa gra / Statystyki / Ustawienia), wybór trudności, Gra, Statystyki, Ustawienia.

### 8.4 Zakres — co zrobić, a co odpuścić
- **Zrobić (MVP):** engine + transformacje + generator z gradingiem, notatki, undo, konflikty, klawiatura, persystencja, responsywność, motywy, lokalne statystyki.
- **Potem:** PWA (`vite-plugin-pwa` — sudoku offline to idealny przypadek), i18n PL/EN (`vue-i18n`), łamigłówka dnia z seeda, deploy na GitHub Pages.
- **Odpuścić / odłożyć na koniec:** logowanie, baza danych, globalny leaderboard. Wymaga backendu (np. Supabase), a wyniki z klienta da się trywialnie sfałszować — duży koszt, mała wartość dla gry jednoosobowej. Lokalne statystyki pokrywają 90% potrzeby.

### 8.5 Tooling
- Aktualne wersje Vite / Vitest / TS / vue-tsc, ESLint 9 (flat config).
- Testy jednostkowe głównie dla `engine/` (solver, generator, grader, transformacje, konflikty) — tam jest ryzyko i tam testy dają najwięcej; kilka testów komponentów; opcjonalnie Playwright dla jednego scenariusza „rozwiąż łamigłówkę”.
- Usunąć scaffold (`HelloWorld`, `icons/`, `base.css` z Vue theme) i Vuetify.

## 9. Proponowana kolejność prac (gdybyś chciał, żebym to realizował)

1. Nowy branch, upgrade toolingu, wyczyszczenie scaffoldu, usunięcie Vuetify.
2. `engine/`: board + solver + konflikty + transformacje + RNG, z testami. Bank 100 plansz przeniesiony do `src/engine/data/puzzles.json`.
3. Store gry + persystencja; plansza (CSS Grid), numpad, klawiatura, notatki, undo — grywalne MVP na telefonie i desktopie.
4. Motywy + ustawienia; ekran wygranej; statystyki lokalne.
5. Grader + generator w Web Workerze; przeskalowanie poziomów trudności wg technik.
6. PWA, i18n, łamigłówka dnia, deploy.

## Weryfikacja (dla implementacji)

- `npm run build` i `npm run type-check` bez błędów; `npx vitest run` — testy engine’u zielone.
- Test solvera: wszystkie 100 plansz z banku mają 1 rozwiązanie; transformacje zachowują poprawność i unikalność.
- `npm run dev` + przeglądarka (DevTools emulacja 360×740 i 1440×900): rozegranie gry myszą, dotykiem i klawiaturą, F5 w trakcie gry → wznowienie, zmiana motywu, wygrana → statystyki zaktualizowane.
