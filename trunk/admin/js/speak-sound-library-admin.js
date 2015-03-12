jQuery(document).ready(function($){

    var custom_uploader;
    $('.removeArtistLink').click(function(){
        var data = {
            'action': 'remove_artist_link',
            'post_id' : $(this).data('post-id')
        };
        // We can also pass the url value separately from ajaxurl for front end AJAX implementations
        jQuery.post(ajax_object.ajax_url, data, function(response) {

        });
        $(this).parent().remove();
        return false;
    });
    $.fn.serializeObject = function()
    {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
    $('#soundForm').submit(function(e){
        var vals = $(this).serializeObject();
        vals.attachmentId = $(window).data('attachmentId');
        vals.isFeatured = $('.featured').is(":checked");

        var errorSelector = $('.error'), data = {
            'action': 'createNewSoundSubmit',
            'attachment': vals
        };
        // We can also pass the url value separately from ajaxurl for front end AJAX implementations
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            if(response != "0"){
                errorSelector.fadeOut();
                $(".updated").html("<p>Sound created! Manage Here</p><a href='"+response+ "'>" + response+"</a>" );
                clearForm();
            }
            else{
                clearForm();
                $(".updated").fadeOut();
                errorSelector.html("<p>Sound could not be created, try again!</p>" );
                errorSelector.fadeIn();
            }
        });
        e.preventDefault();

    });
    function clearForm(){
        $("#soundForm").trigger('reset');
        $("#upload_sound").val("");
    }
    $('#create_sounds_button').click(function(e){
        e.preventDefault();
        var errorSelector = $('.error'), data = {
            'action': 'createNewSoundsFromFolderSubmit',
            'soundsUrl':  $('#upload_sound').val()
        };
        console.log(ajax_object.ajax_url);
        jQuery.post(ajax_object.ajax_url, data, function(response) {
            console.log(response);
            if(response.length > 0){
                errorSelector.fadeOut();
                $(".updated").html("<p>Sounds created! Manage <a href="+response+">Here</a></p>").fadeIn();
                clearForm();
            }
            else{
                clearForm();
                $(".updated").fadeOut();
                errorSelector.html("<p>Sound could not be created, try again!</p>" );
                errorSelector.fadeIn();
            }
        });


    });
    $('#upload_sound_button').click(function(e) {
        e.preventDefault();

        //If the uploader object has already been created, reopen the dialog
        if (custom_uploader) {
            custom_uploader.open();
            return;
        }

        //Extend the wp.media object
        custom_uploader = wp.media.frames.file_frame = wp.media({
            title: 'Choose Song File',
            button: {
                text: 'Choose Song'
            },
            multiple: false
        });


        custom_uploader.on( 'select', function() {

            var selection = custom_uploader.state().get('selection');
            var attachment = selection.first().toJSON();
            postData(attachment);
            $("input.soundName").val(attachment['title']);
            $("input.artist").val(attachment['meta']['artist']);
            $("input.album").val(attachment['meta']['album']);
            $('#upload_sound').val(attachment.url);
        });

        //Open the uploader dialog
        custom_uploader.open();

    });

    function postData(attachment){
        // since 2.8 ajaxurl is always defined in the admin header and points to admin-ajax.php
        var data = {
            'action': 'uploader_callback',
            'attachment': attachment      // We pass php values differently!
        };
        // We can also pass the url value separately from ajaxurl for front end AJAX implementations
        jQuery.post(ajax_object.ajax_url, data, function(response) {

            if(response != false){
                $(window).data('attachmentId', response);
                $(".error").fadeOut();
                $(".updated").html("<p>Uploader completed successfully, go ahead and create your sound!</p>" );
                $(".updated").fadeIn();
            }
            else{
                $(".updated").fadeOut();
                $(".error").html("<p>Uploader could not create sound based on upload, please try with a valid audio file with id3v2 tags.</p>" );
                $(".error").fadeIn();
            }
        });
    }

});