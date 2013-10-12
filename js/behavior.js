var optBtn = document.querySelector('#optionsBtn');

optBtn.addEventListener('click', function (evt) {
	var optsPanel = $(document.querySelector('#options'));
	
	if (optsPanel.hasClass("hideOptions")) {
		optsPanel.removeClass('hideOptions');
		console.log('showing opts')
	} else {
		optsPanel.addClass('hideOptions');
		console.log('hiding opts')
	}
	
	
});