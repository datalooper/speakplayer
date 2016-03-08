jQuery(document).ready(function($){

    var custom_uploader;

    //******** Upload New Sound Admin Tab ********//

    //Opens custom uploader
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

        //after selecting a file, post the data and fill out the input forms
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

    //Posts attachment from custom uploader
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


    //Attempt to submit sound
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


    function clearForm(){
        $("#soundForm").trigger('reset');
        $("#upload_sound").val("");
    }


    //******** Create Sounds from Folder Admin Tab ********//

    $('#create_sounds_button').click(function(e){
        e.preventDefault();
        var errorSelector = $('.error'), data = {
            'action': 'createNewSoundsFromFolderSubmit',
            'soundsUrl':  $('#upload_sound').val()
        };
        jQuery.post(ajax_object.ajax_url, data, function(response) {
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

    //******** Add Sounds from Soundcloud Tab ********//

    $('#add_user_button').click(function(e){
        e.preventDefault();
        console.log("adding user");

        var errorSelector = $('.error'), user = $('#add_user').val();
        if(SC){

                SC.resolve(user).then(function(userinfo) {

                    var data = {
                        'action' : 'add_soundcloud_user',
                        'user' : userinfo.id
                    };
                    jQuery.post(ajax_object.ajax_url, data, function(response) {
                        console.log("response length " + response.trim().length + " response " + response);
                        if(response.trim().length > 0){
                            clearForm();
                            $(".updated").fadeOut();
                            errorSelector.html("<p>User Could Not Be Added,"+response +" try again!</p>" );
                            errorSelector.fadeIn();
                        }
                        else{
                            errorSelector.fadeOut();
                            $(".updated").html("<p>New User Added Successfully</p>").fadeIn();
                        }
                    });


                }).catch(function (err) {
                    console.log("error resolving: " + err);
                    $(".updated").fadeOut();
                    errorSelector.html("<p>Invalid Soundcloud User, Try again!</p>" );
                    errorSelector.fadeIn();
                    return;
                });
        } else{
            console.log("NO SC");
        }


    });
    $(window).on('getTracks', function(event, users){
        getTracks(users);
    });



    list = {

        /**
         * Register our triggers
         *
         * We want to capture clicks on specific links, but also value change in
         * the pagination input field. The links contain all the information we
         * need concerning the wanted page number or ordering, so we'll just
         * parse the URL to extract these variables.
         *
         * The page number input is trickier: it has no URL so we have to find a
         * way around. We'll use the hidden inputs added in TT_Example_List_Table::display()
         * to recover the ordering variables, and the default paged input added
         * automatically by WordPress.
         */
        init: function () {
            // This will have its utility when dealing with the page number input
            var timer;
            var delay = 500;

            // Pagination links, sortable link
            $('.tablenav-pages a, .manage-column.sortable a, .manage-column.sorted a').on('click', function (e) {
                // We don't want to actually follow these links
                e.preventDefault();
                // Simple way: use the URL to extract our needed variables
                var query = this.search.substring(1);

                var data = {
                    paged: list.__query(query, 'paged') || '1',
                    order: list.__query(query, 'order') || 'asc',
                    orderby: list.__query(query, 'orderby') || 'title'
                };
                list.update(data);
            });

            // Page number input
            $('input[name=paged]').on('keyup', function (e) {

                // If user hit enter, we don't want to submit the form
                // We don't preventDefault() for all keys because it would
                // also prevent to get the page number!
                if (13 == e.which)
                    e.preventDefault();

                // This time we fetch the variables in inputs
                var data = {
                    paged: parseInt($('input[name=paged]').val()) || '1',
                    order: $('input[name=order]').val() || 'asc',
                    orderby: $('input[name=orderby]').val() || 'title'
                };

                // Now the timer comes to use: we wait half a second after
                // the user stopped typing to actually send the call. If
                // we don't, the keyup event will trigger instantly and
                // thus may cause duplicate calls before sending the intended
                // value
                window.clearTimeout(timer);
                timer = window.setTimeout(function () {
                    list.update(data);
                }, delay);
            });
        },

        /** AJAX call
         *
         * Send the call and replace table parts with updated version!
         *
         * @param    object    data The data to pass through AJAX
         */
        update: function (data, tracklist) {
            data = $.extend(
                {
                    _ajax_custom_list_nonce: $('#_ajax_custom_list_nonce').val(),
                    action: '_ajax_fetch_custom_list',
                    tracklist : tracklist
                },
                data)
            console.log(data);
            $.ajax({
                // /wp-admin/admin-ajax.php
                url: ajaxurl,
                // Add action and nonce to our collected data
                data: data,
                method : "POST",

                // Handle the successful result
                success: function (response) {
                    // WP_List_Table::ajax_response() returns json
                    var response = $.parseJSON(response);
                    // Add the requested rows

                    if (response.rows.length)
                        $('#the-list').html(response.rows);
                    // Update column headers for sorting
                    if (response.column_headers.length)
                        $('thead tr, tfoot tr').html(response.column_headers);
                    // Update pagination for navigation
                    if (response.pagination.bottom.length)
                        $('.tablenav.top .tablenav-pages').html($(response.pagination.top).html());
                    if (response.pagination.top.length)
                        $('.tablenav.bottom .tablenav-pages').html($(response.pagination.bottom).html());
                    if(response.total_pages > 1){
                        $('.no-pages').removeClass('no-pages')
                    }

                    // Init back our event handlers
                    list.init();
                    rebindChecks();

                }
            });
        },

        /**
         * Filter the URL Query to extract variables
         *
         * @see http://css-tricks.com/snippets/javascript/get-url-variables/
         *
         * @param    string    query The URL query part containing the variables
         * @param    string    variable Name of the variable we want to get
         *
         * @return   string|boolean The variable value if available, false else.
         */
        __query: function (query, variable) {
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[0] == variable)
                    return pair[1];
            }
            return false;
        },
    }


    function getTracks(users){
        var tracklist = [], opComplete;
        $.each(users, function(key, user){
            var getString = '/users/' + user + "/tracks";
            SC.get(getString).then(function (tracks) {

                jQuery.each(tracks, function (index, track) {
                    var trackObj = {};
                    trackObj.title = track.title;
                    trackObj.numplays = track.playback_count;
                    trackObj.username =  track.user.username;
                    trackObj.id = track.id;
                    tracklist.push(trackObj);
                });
                if(key == users.length-1){
                    opComplete = true;
                }

            }).catch(function (err) {
                console.log("error getting tracks: " + err);
                return;
            });
        });
        var timer = setInterval(function() {
            if (opComplete) {
                list.init();
                list.update({}, tracklist);
                clearInterval(timer);
            }
        }, 500 );



    }

    function rebindChecks(){
        $('thead, tfoot').find('.check-column :checkbox').on( 'click.wp-toggle-checkboxes', function( event ) {
            var $this = $(this),
                $table = $this.closest( 'table' ),
                controlChecked = $this.prop('checked'),
                toggle = event.shiftKey || $this.data('wp-toggle');

            $table.children( 'tbody' ).filter(':visible')
                .children().children('.check-column').find(':checkbox')
                .prop('checked', function() {
                    if ( $(this).is(':hidden,:disabled') ) {
                        return false;
                    }

                    if ( toggle ) {
                        return ! $(this).prop( 'checked' );
                    } else if ( controlChecked ) {
                        return true;
                    }

                    return false;
                });

            $table.children('thead,  tfoot').filter(':visible')
                .children().children('.check-column').find(':checkbox')
                .prop('checked', function() {
                    if ( toggle ) {
                        return false;
                    } else if ( controlChecked ) {
                        return true;
                    }

                    return false;
                });
        });

    }
});