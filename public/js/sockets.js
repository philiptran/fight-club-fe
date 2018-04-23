(function() {

    var connectionMethod = _.isNil(APP_PARAMS.GAME_SERVER_CONNECTION_METHOD) ? 'poll' : APP_PARAMS.GAME_SERVER_CONNECTION_METHOD;
    if (connectionMethod !== 'socket') {
        // Not socket method, return immediately
        return;
    }
    console.log('Using socket method');

    let update = function (data) {

        console.log('update----');
        console.log(data);

        let blue_team_hp = _.get(data, ['blue_team', 'hp']);
        let red_team_hp = _.get(data, ['red_team', 'hp']);
        let blue_team_starting_hp = _.get(data, ['blue_team', 'starting_hp']);
        let red_team_starting_hp = _.get(data, ['red_team', 'starting_hp']);

        $('#blue_team_hp')
            .css('width', _.toString(_.toInteger(blue_team_hp / blue_team_starting_hp * 100)) + '%')
            .attr('aria-valuenow', _.toString(blue_team_hp))
            .attr('aria-valuemin', _.toString(0))
            .attr('aria-valuemax', _.toString(blue_team_starting_hp))
            .html(_.toString(blue_team_hp) + ' / ' + _.toString(blue_team_starting_hp));

        $('#blue_team_hp_fill')
            .css('width', _.toString(_.toInteger((blue_team_starting_hp - blue_team_hp) / blue_team_starting_hp * 100)) + '%')
            .attr('aria-valuenow', _.toString(blue_team_starting_hp - blue_team_hp))
            .attr('aria-valuemin', _.toString(0))
            .attr('aria-valuemax', _.toString(blue_team_starting_hp))
            .html(_.toString(blue_team_starting_hp - blue_team_hp) + ' / ' + _.toString(blue_team_starting_hp));

        $('#red_team_hp')
            .css('width', _.toString(_.toInteger(red_team_hp / red_team_starting_hp * 100)) + '%')
            .attr('aria-valuenow', _.toString(red_team_hp))
            .attr('aria-valuemin', _.toString(0))
            .attr('aria-valuemax', _.toString(red_team_starting_hp))
            .html(_.toString(red_team_hp) + ' / ' + _.toString(red_team_starting_hp));

        $('#red_team_hp_fill')
            .css('width', _.toString(_.toInteger((red_team_starting_hp - red_team_hp) / red_team_starting_hp * 100)) + '%')
            .attr('aria-valuenow', _.toString(red_team_starting_hp - red_team_hp))
            .attr('aria-valuemin', _.toString(0))
            .attr('aria-valuemax', _.toString(red_team_starting_hp))
            .html(_.toString(red_team_starting_hp - red_team_hp) + ' / ' + _.toString(red_team_starting_hp));


        $('#blue_team_hp_bar').css('width', _.toString(_.toInteger(blue_team_hp / blue_team_starting_hp * 32)) + '%');

        $('#red_team_hp_bar').css('width', _.toString(_.toInteger(red_team_hp / red_team_starting_hp * 32)) + '%');


        let $winner = $('#winner');
        let $winnerTitle = $winner.find('#team_name');

        if (data.winner) {
            $winnerTitle.html((data.winner === 'red_team' ? 'Red Team' : 'Blue Team'));
            $winner.toggleClass('hidden', false);
        } else {
            $winner.toggleClass('hidden', true);
            $winnerTitle.html('');
        }
    };

    $(function () {

        var poll = 0;

        let serverProtocol = APP_PARAMS.GAME_SERVER_PROTOCOL;
        let serverHost = APP_PARAMS.GAME_SERVER_HOST;
        let serverPort = APP_PARAMS.GAME_SERVER_PORT;
        let serverUrl = serverProtocol + '://' + serverHost + ":" + serverPort;

        console.log('Connecting to socket ' + serverUrl + '/sockets');
        var socket = io(serverUrl, {path: '/sockets'});
        console.log('Connected ' + socket.connected);

        socket.on('update', update);

        socket.emit('refresh');

        socket.on('error', function (err) {
            console.error(err);

            let $error = $('#error');
            let $errorText = $error.find('div.card');

            $errorText.html(err.message);
            $error.toggleClass('hidden', false);
            setTimeout(function () {
                $error.toggleClass('hidden', true);
                $errorText.html('');
            }, 5000);

        });

        $('#reset_game').on('click', function () {
            socket.emit('newGame');
        });

        $('body').on('click', '#blue_team_hit, #red_team_hit', function (evt) {

            let $this = $(this);
            let team = $this.data('team');

            socket.emit('hit', {team: team});

        });

    });
})();
