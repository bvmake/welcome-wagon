(function ($) {

	function pageLoaded () {
		load();
	}

        var guests = [];
        var position = -1;

	function loaded (data) {
            guests = data || [];
            setTimeout(load, 60000);
            showName();
	}

        function showName() {
            if (guests.length > 0) { 
                //if position goes past end of array, set to zero
                $('#name').html('<span>' + guests[(position + 1 >= guests.length ? position = 0 : ++position)].fullName + '</span>'); 
            }
            setTimeout(showName, 5000);
	}

	/* TODO: implement errorOccurred */

	function load () {
            $.ajax({
                url: '/guests',
                success: loaded,
                //error: errorOccurred
            });
	}

	$(document).on('ready', pageLoaded);

})(jQuery);
