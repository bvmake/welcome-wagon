(function ($) {

	function pageLoaded () {
		$('#submit').on('click', submitGuest);
	}

	function postSent () {
		$('#welcome').hide();
		$('#howdy').addClass('show').find('span').html($('#email').val());
	}

	/* TODO: implement postErrorOccurred */

	function submitGuest (e) {
		e.preventDefault();
		e.stopPropagation();
		var first = $('#first').val();
		var last = $('#last').val();
		var email = $('#email').val();
		if (first && last && email) {
			var guest = { 
				/*id: uuid.v4(),*/
				firstName: first,
				lastName: last,
				email: email
			};
			$.ajax({
				url: '/guest',
				method: 'POST',
				contentType: 'application/json',
				data: JSON.stringify(guest),
				success: postSent/*,
				error: postErrorOccurred*/
			});
		}
		$('#guest').val('');
		return false;
	}

	$(document).on('ready', pageLoaded);

})(jQuery);
