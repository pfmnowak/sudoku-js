class DigitsView {
	addHandlerClick(handler) {
		let digits = document.querySelectorAll('.tile--big');
		digits.forEach(tile =>
			tile.addEventListener('click', function () {
				handler(tile);
			})
		);
	}
}

export default new DigitsView();
