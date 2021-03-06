var MongoSkin = require('mongoskin');

function MongoConnector(config){
	this.name = 'MongoConnector';
	this.db = MongoSkin.db(config.dbURL, {nativeParser: true});
}

MongoConnector.prototype = {
	init: function(){},
	createStory: function (storyName, callback){
		var PIN = Math.round(Math.random()*20000);
		var connector = this;
		this.getStory(PIN, function(story){
			if (story){
				var newPIN = Math.round(Math.random()*20000);
				connector.getStory(newPIN, this);
			} else {
				var newStory = {
					name: storyName,
					pin: PIN,
					fragments: []
				}
				connector.db.collection('stories').insert(newStory,
					function(err, result){
						if (err) {
							console.log(err);
					    } else {
					    	console.log(result);
					    	callback(result.ops[0]);
					    }
					}
				);
			}
		})
	},
	getStory: function (storyPIN, callback){
		storyPIN = parseInt(storyPIN);
	    this.db.collection('stories').find({pin: storyPIN}).toArray(
	    	function (err, result) {
	    		if (err) {
					console.log(err);
			    } else {
			    	callback(result[0]);
			    }
		    }
	    );
	},
	getStoriesList: function(callback){
		this.db.collection('stories').find({},{name: 1, pin: 1}).toArray(
	    	function (err, result) {
	    		if (err) {
					console.log(err);
			    } else {
			    	callback(result);
			    }
		    }
	    );
	},
	saveStory: function(story){
		this.db.collection('stories').update({_id: story._id}, {$set:{fragments:story.fragments}}, function(err, result) {
			if (err) {
				console.log(err);
		    }
		});
	},
	saveMessage: function(message){
		this.db.collection('messages').insert(message,
			function(err, result){
				if (err) {
					console.log(err);
			    } else {
			    	console.log('inserted!', result);
			    }
			}
		);
	},
	setPJ: function(pj){
		if (this.db.collection('pjs').find('{player:' + pj.player + '}').count() > 0){
			return false;
		}	else {
			this.db.collection('pjs').insert(pj,
				function(err, result){
					if (err) {
						console.log(err);
				    } else {
				    	console.log('inserted!', result);
				    }
				}
			);
			return true;
		}
	},
	getPJ: function(who){
		return this.db.collection('pjs').find('{player:' + pj.player + '}');
	}
}

module.exports = MongoConnector;
