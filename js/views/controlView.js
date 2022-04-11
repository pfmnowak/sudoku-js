class ControlView {
	addHandlerStart(handler) {
		document.getElementById('start-btn').addEventListener('click', handler);
	}
}

export default new ControlView();
