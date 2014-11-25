var channel = "#fantasy-stories";
var config = {
	channels: [channel],
	server: "irc.freenode.net",
	botName: "rolebot"
};

var irc = require("irc");
var fs = require("fs");

var story = new Array();
var players = new Array();
var playersMap = {};

var turnModes = ["random", "roundRobin"];
var turnMode = 0;

var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels
});

bot.addListener("join", function(channel, who) {
	if (who.indexOf("slash") > -1)
		return;
	say(who, who + ", welcome to the channel. I am teh slashbot, I can tell you the [story so far], or the [latest] part. To add something to the story start your message with [story:] without the brackets. Have fun!");
	if (!playersMap[who])
		players.push(who);
});

bot.addListener("message", function(from, to, text, message) {
	if (!text)
		return;
	if (text.indexOf("story:") == 0){
		var storyText = text.substring("story:".length);
		addStoryPart(from, storyText);
	} else if (text.indexOf("correct:") == 0){
		var storyText = text.substring("correct:".length);
		correctStoryPart(from, storyText);
	} else if (text.indexOf("slashbot") == 0){
		if (text.indexOf("introduce yourself") > -1){
			introduce(from);
		} else if (text.indexOf("help") > -1){
			help(from);
		} else if (text.indexOf("joke") > -1){
			joke();
		} else	if (text.indexOf("Who is your creator?") > -1){
			creator();
		} else if (text.indexOf("latest") > -1){
			latest(from);
		} else if (text.indexOf("story so far") > -1){
			fullStory(from);
		} else if (text.indexOf("share the story") > -1){
			fullStory(false);
		} else if (text.indexOf("next turn") > -1){
			nextTurn();
		} else if (text.indexOf("turn mode") > -1){
			changeTurnMode();
		} else {
			wtf(from);
		}	
	}
});

function introduce(){
	share("I am the slashbot, I can tell you the [story so far], or the [latest] part. If you want to add something to the story, be sure to start your message with [story:] without the brackets. Have fun!");
}

function nextTurn(){
	if(turnModes[turnMode] == 'roundRobin'){
		var randomPlayer = players[Math.floor(Math.random() * players.length)];
		share("I suggest "+randomPlayer+" goes next.");
	} else if (turnModes[turnMode] == 'random'){
		var randomPlayer = players[Math.floor(Math.random() * players.length)];
		share("I suggest "+randomPlayer+" goes next.");			
	}	
}

function changeTurnMode(){
	turnMode++;
	if(turnMode==turnModes.length)
		turnMode = 0;
	share("New turn mode: " + turnModes[turnMode] + ".");
}

function joke(){
	share("This is no time for jokes, my friend.");
}

function creator(){
	share("Slash did, @slashie_ on twitter.");
}

function latest(who){
	if (story.length == 0){
		say(who, "There's no story yet.");
		return;
	}
	var storypart = story[story.length-1];
	say(who, "Latest part of the story was from "+storypart.author+", he added: \""+storypart.story+"\"");
}

function fullStory(who){
	if (story.length == 0){
		if (!who){
			share("There's no story yet.");
		} else {
			say(who, "There's no story yet.");
		}
		return;
	}
	if (!who){
		share("This is the story so far:");
	}
	for (var i = 0; i < story.length; i++){
		var storypart = story[i];
		if (!who){
			share(storypart.story);
		} else {
			say(who, storypart.story);
		}
	}
}

function wtf(who){
	share("Perhaps you should rephrase. Or simply ask me for help.");
}

function addStoryPart(from, storyText){
	var storypart = {
		author: from,
		story: storyText
	};
	story.push(storypart);	
	saveStory();	
	say(from, "Added.");
}

function saveStory(){
	var serializedStory = JSON.stringify(story);
	console.log(serializedStory);
	fs.writeFile('story.json', serializedStory, function (err) {
        if (err) throw err;
        console.log('It seems as if the file was saved, we shall see.');
    });
}

function correctStoryPart(from, storyText){
	if (story.length == 0){
		say(from, "There's no story yet.");
		return;
	}
	var storypart = story[story.length-1];
	if (storypart.author === from){
		storypart = {
			author: from,
			story: storyText
		};
		story[story.length-1] = storypart;
		saveStory();
		say(from, "Corrected.");
	} else {
		say(from, "Sorry, only "+storypart.author+" can correct his fragment.");
	}
}

function help(who){
	say(who, "[story:] Adds a new fragment to the story");
	say(who, "[correct:] Corrects the last fragment of the story");
	say(who, "[latest] Gets the latest fragment");
	say(who, "[story so far] Gets the complete story.");
	say(who, "[next turn] Suggest who should do the next turn.");
	say(who, "[share the story] Shows the full store for everyone.");	
}

function say(who, text){
	bot.notice(who, text);
}

function share(text){
	bot.say(channel, text);
}