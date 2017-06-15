var config = require('./config'),
        knex = require('knex')(config.knex_options),
        Promise = require('knex/lib/promise');

var startq = {
    'question': 'start',
    'answers': JSON.stringify(['start']),
    'answer_index': 1,
    'hints': '["start"]',
    'nb_players': 0
};

var qs = [
    {
        question: '[4 - (2 - 2*(5 - 2) + 7)] + 7',
        answers: ['8', '-1', '0','6'],
        'hints': ['Remove grouping symbols: () in first', 'Remove grouping symbols: [] in second', 'Pay attention to negative values'],
        'nb_players': 2,
        answer_index: 1
    }, {
        question: "Simplify 3(3x - (7 - 7y + 7x) + 7y) ",
        answers: ['-35x + 23y - 15 ', '45x + 79y - 30 ', '2x + 3y','None of the above'],
        'hints': ['Plug "-5" in for each "x" in the expression ', 'Evaluate using "order of operations" steps ', 'x does not equal y'],
        'nb_players': 2,
        answer_index: 3
    }, {
        question: "Who died abord the plane named 'American Pie'?",
        answers: ['Don McLean', 'John Denver', 'Buddy Holly'],
        'hints': ['Hint1', 'Hint2', 'Hint3'],
        'nb_players': 2,
        answer_index: 3
    }, {
        question: 'How old was Mozart when he composed his first piece?',
        answers: ['5', '7', '10'],
        'hints': ['very young', 'very young', 'He did not go to school'],
        'nb_players': 2,
        answer_index: 1
    },  {
        question: 'How many people should be randomly selected from a group so that the probability that two of these people have the same birthday will be greater than 1 in 2 chance??',
        answers: ['23 ', '56', '3'],
        'hints': ['Calculate the possibility that 2 people do not have the same birthday.', 'Leap years will not be taken into account', '1 year= 365 days'],
        'nb_players': 2,
        answer_index: 1
    },
    {
        question: 'Who was the first president of the United States?',
        answers: ['Thomas Jefferson', 'George Jefferson', 'George Washington'],
        'hints': ['Hint1', 'Hint2', 'Hint3'],
        'nb_players': 2,
        answer_index: 3
    }, 
    {
        question: 'Which is the smallest number whose numbers are reversed when multiplied by 9',
        answers: ['81', '99', '1089'],
        'hints': ['Do not take into account 0', '9 being close to 10, it is quickly made to add a figure.', '9 = 9x?'],
        'nb_players': 2,
        answer_index: 3
    }, {
        question: 'Whose song was used to tune the compression algorithms for the mp3 format?',
        answers: ['Elvis Presley', 'Susanne Vega', 'Whitney Houston'],
        'hints': ['Hint1', 'Hint2', 'Hint3'],
        'nb_players': 2,
        answer_index: 2
    }, {
        question: 'Which planet has the tallest mountains?',
        answers: ['Earth', 'Mars', 'Jupiter'],
        'hints': ['Hint1', 'Hint2', 'Hint3'],
        'nb_players': 2,
        answer_index: 2
    }, {
        question: 'Which country did Stalin invade in 1939?',
        answers: ['Poland', 'Finland', 'Ukraine'],
        'hints': ['Hint1', 'Hint2', 'Hint3'],
        'nb_players': 2,
        answer_index: 1
    }, {
        question: 'Which US general was driven out of the Phillipines in 1942?',
        answers: ['Marshall', 'MacArthur', 'Eisenhower', 'Bradley'],
        'hints': ['Hint1', 'Hint2', 'Hint3'],
        'nb_players': 2,
        answer_index: 2
    }, {
        question: 'Which historical figure lent his name to an XML parser?',
        answers: ['Herodotus', 'Astylos', 'Artemis', 'Xerces'],
        'hints': ['Hint1', 'Hint2', 'Hint3'],
        'nb_players': 2,
        answer_index: 4
    }, {
        question: 'Who was the shortest U.S. President?',
        answers: ['James Madison', 'Howard Taft', 'Milard Filmore'],
        'hints': ['Hint1', 'Hint2', 'Hint3'],
        'nb_players': 2,
        answer_index: 1
    }, {
        question: "The Millenium Falcon made the Kessel run in how long?",
        answers: ['8 nanoclicks', '3.7 light-seconds', '12 parsecs'],
        'hints': ['Hint1', 'Hint2', 'Hint3'],
        'nb_players': 2,
        answer_index: 3
    }, {
        question: 'The city of Mayfield was annexed by Palo Alto in what year?',
        answers: ['1925', '1940', '1958', '1967'],
        'hints': ['Hint1', 'Hint2', 'Hint3'],
        'nb_players': 2,
        answer_index: 1
    }, {
        question: 'Which US president attended the very first Big Game?',
        answers: ['Woodrow Wilson', 'Franklin Roosevelt', 'John Kennedy', 'Herbert Hoover'],
        'hints': ['Hint1', 'Hint2', 'Hint3'],
        'nb_players': 2,
        answer_index: 4
    }, {
        question: "Who turned down the lead for the movie 'American Beauty'?",
        answers: ['Alan Alda', 'Chevy Chase', 'Robert Downey Jr.'],
        'hints': ['Hint1', 'Hint2', 'Hint3'],
        'nb_players': 2,
        answer_index: 2
    }, {
        question: "Who was really 'Deep Throat'?",
        answers: ['John Dean', 'Alexander Haig', 'Mark Felt'],
        'hints': ['Hint1', 'Hint2', 'Hint3'],
        'nb_players': 2,
        answer_index: 3
    }, {
        question: "Who played Mr. Freeze?",
        answers: ['Arnold Schwarzenegger', 'Jean-Claude Van Damme', 'Vin Diesel', 'Michael Keaton'],
        'hints': ['Old Mr Olympia', 'Bodybuilder', 'VEry famous'],
        'nb_players': 2,
        answer_index: 1
    }, {
        question: "'Salacious Crumb' is a character from what movie?",
        answers: ['Goonies', 'Star Wars', 'Battlefield Earth'],
        'hints': ['Hint1', 'Hint2', 'Hint3'],
        'nb_players': 2,
        answer_index: 2
    }, {
        question: "What is an SP in Scientology?",
        answers: ["social precom", "sound prescence", "suppressive person"],
        'hints': ['Hint1', 'Hint2', 'Hint3'],
        'nb_players': 2,
        answer_index: 3
    }, {
        question: "Much of the plutonium for the first atomic bomb was produced in what state?",
        answers: ['Tennessee', 'New Mexico', 'Nevada', 'Colorado'],
        'hints': ['Hint1', 'Hint2', 'Hint3'],
        'nb_players': 2,
        answer_index: 1
    }];

knex('questions').del().then(function () {
    return knex('questions').insert(startq);
}).then(function () {
    return Promise.map(qs, function (question) {
        console.log("Creating ", question.question);
        question.answers = JSON.stringify(question.answers);
        question.hints = JSON.stringify(question.hints);
        return knex('questions').insert(question);
    });
}).then(function () {
    knex('questions').insert({
        question: 'end',
        answers: '["end"]',
        hints: '["end"]',
        nb_players: 0,
        answer_index: 1
    }).then(function () {
        process.exit(0);
    });
});