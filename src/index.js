/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/


/**
 * App ID for the skill
 */
var APP_ID = undefined; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

var request = require('request');
var cheerio = require('cheerio');

/**
 * The AlexaSkill Module that has the AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');


/**
 * HistoryBuffSkill is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var SheridansSpecialSkill = function() {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
SheridansSpecialSkill.prototype = Object.create(AlexaSkill.prototype);
SheridansSpecialSkill.prototype.constructor = SheridansSpecialSkill;

SheridansSpecialSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("SheridansSpecialSkill onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);

    // any session init logic would go here
};

SheridansSpecialSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("SheridansSpecialSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    getWelcomeResponse(response);
};

SheridansSpecialSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);

    // any session cleanup logic would go here
};

SheridansSpecialSkill.prototype.intentHandlers = {

    "GetSheridansSpecialIntent": function (intent, session, response) {
        console.log('Firing GetSheridansSpecialIntent')
        handleSheridansSpecial(response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can ask for today's food special at Sheridan's");
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "Goodbye",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "Goodbye",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    }
};


function handleSheridansSpecial(response) {
    var speechOutput = '';
    getSheridansSpecial(function(price, special) {
        console.log('Got special succesfully, firing response event');
        speechOutput = "Today's food special at Sheridan's is " + special + " for the price of " + price;
        var cardTitle = "Sheridan's Special";
        response.tellWithCard(speechOutput, cardTitle, speechOutput);
    });
}

function getSheridansSpecial(handleCallback) {
    console.log('Attempting to scrape special');

    var url = 'http://www.sheridanfruit.com/Daily-Deli-Menu.html';
    var priceSelector = '#center-main > div > div > table:nth-child(2) > tbody > tr:nth-child(1) > td:nth-child(1) > p:nth-child(3) > span > span';
    var specialSelector = '#center-main > div > div > table:nth-child(2) > tbody > tr:nth-child(2) > td:nth-child(1) > div >:first-child';

    request(url, function(error, response, html){
        if (!error) {
            var $ = cheerio.load(html);
            var price = $(priceSelector).text();
            var special = $(specialSelector).text();

            console.log('Found special, firing callback.')

            handleCallback(price, special);
        } else {
            console.log('Error occurred: ' + error);
        }
    });
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the IssLocation Skill.
    var skill = new SheridansSpecialSkill();
    skill.execute(event, context);
};

