window.addEventListener("load",function() {

var Q = window.Q = Quintus()
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI")
        .setup({ maximize: true })
        .controls().touch()

var SPRITE_BOX = 1;
var TIMER;

Q.gravityY = 2000;
Q.TIME_START = 0;

Q.Sprite.extend("Player",{

  init: function(p) {

    this._super(p,{
      sheet: "player",
      sprite: "player",
      collisionMask: SPRITE_BOX, 
      x: 40,
      y: 555,
      standingPoints: [ [ -16, 44], [ -23, 35 ], [-23,-48], [23,-48], [23, 35 ], [ 16, 44 ]],
      duckingPoints : [ [ -16, 44], [ -23, 35 ], [-23,-10], [23,-10], [23, 35 ], [ 16, 44 ]],
      speed: 500,
      jump: -700,
      hitDamage: 5,
  	  strength: 100,
  	  score: 0
    });

    this.p.points = this.p.standingPoints;

    this.add("2d, animation");
	
  },

  step: function(dt) {
    this.p.vx += (this.p.speed - this.p.vx)/4;

    if(this.p.y > 555) {
      this.p.y = 555;
      this.p.landed = 1;
      this.p.vy = 0;
    } else {
      this.p.landed = 0;
    }

    if(Q.inputs['up'] && this.p.landed > 0) {
      this.p.vy = this.p.jump;
    } 

    this.p.points = this.p.standingPoints;
    if(this.p.landed) {
      if(Q.inputs['down']) { 
        this.play("duck_right");
        this.p.points = this.p.duckingPoints;
      } else {
        this.play("walk_right");
      }
    } else {
      this.play("jump_right");
    }

    this.stage.viewport.centerOn(this.p.x + 300, 400 );

  }  
  
});

Q.Sprite.extend("Box",{
  init: function() {

    var levels = [ 565, 540, 500, 450 ];

    var player = Q("Player").first();
    this._super({
      x: player.p.x + Q.width + 50,
      y: levels[Math.floor(Math.random() * 3)],
      frame: Math.random() < 0.5 ? 1 : 0,
      scale: 2,
      type: SPRITE_BOX,
      sheet: "crates",
      vx: -600 + 200 * Math.random(),
      vy: 0,
      ay: 0,
      theta: (300 * Math.random() + 200) * (Math.random() < 0.5 ? 1 : -1)
    });


    this.on("hit");
  },

  step: function(dt) {
    this.p.x += this.p.vx * dt;


    this.p.vy += this.p.ay * dt;
    this.p.y += this.p.vy * dt;
    if(this.p.y != 565) {
      this.p.angle += this.p.theta * dt;
    }

    if(this.p.y > 800) { this.destroy(); }

  },

  hit: function(data) {
	var player = Q("Player").first();
	
    this.p.type = 0;
    this.p.collisionMask = Q.SPRITE_NONE;
    this.p.vx = 200;
    this.p.ay = 400;
    this.p.vy = -300;
    this.p.opacity = 0.5;
	/* this.destroy(); */
	player.p.strength -= player.p.hitDamage;
	Q.stageScene('hud', 3, player.p);
	if (player.p.strength <= 0) {
	  player.p.strength = 0;
	  player.p.opacity = 0;
	  // this.p.opacity = 0;
      this.resetLevel();
    }
  },
  
  resetLevel: function() {
    // Q.stageScene("level1");
    Q.stageScene("endGame",1, { label: "You Died" });
  },
  

});

Q.GameObject.extend("BoxThrower",{
  init: function() {
    this.p = {
      launchDelay: 0.75,
      launchRandom: 1,
      launch: 2
    }
  },

  update: function(dt) {
    this.p.launch -= dt;

    if(this.p.launch < 0) {
      this.stage.insert(new Q.Box());
      this.p.launch = this.p.launchDelay + this.p.launchRandom * Math.random();
    }
  }

});

Q.GameObject.extend("GameTimer",{
	init: function() {
		this.p = {
			
		}
		// var player = Q("Player").first();
		// TIMER =  setInterval(function(){
		  // player.p.score += 10;
		// }, 1000);	  

		// console.log(player.p.score);
	},
	
	update: function(dt) {
		
		
	}
	
});

Q.scene("level1",function(stage) {

  stage.insert(new Q.Repeater({ asset: "background-wall.png",
                                speedX: 0.5 }));

  stage.insert(new Q.Repeater({ asset: "background-floor.png",
                                repeatY: false,
                                speedX: 1.0,
                                y: 300 }));

  stage.insert(new Q.BoxThrower());

  stage.insert(new Q.Player());
  
  stage.insert(new Q.GameTimer());
  
  stage.add("viewport");
  

});

Q.scene('hud',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: 50, y: 0
  }));

  var label = container.insert(new Q.UI.Text({x:200, y: 20,
    label: "Score: " + stage.options.score, color: "white" }));

  var strength = container.insert(new Q.UI.Text({x:50, y: 20,
    label: "Health: " + stage.options.strength + '%', color: "white" }));

  container.fit(20);
});


Q.scene('endGame',function(stage) {
  var box = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));
  
  var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                           label: "Play Again" }))         
  var label = box.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
                                        label: stage.options.label }));
  button.on("click",function() {
    Q.clearStages();
    Q.stageScene('level1');
	Q("Player").first().p.strength = 100;
    Q.stageScene('hud', 3, Q("Player").first().p);
  });
  box.fit(20);
});
  
Q.load("player.json, player.png, background-wall.png, background-floor.png, crates.png, crates.json", function() {
    Q.compileSheets("player.png","player.json");
    Q.compileSheets("crates.png","crates.json");
    Q.animations("player", {
      walk_right: { frames: [0,1,2,3,4,5,6,7,8,9,10], rate: 1/15, flip: false, loop: true },
      jump_right: { frames: [13], rate: 1/10, flip: false },
      stand_right: { frames:[14], rate: 1/10, flip: false },
      duck_right: { frames: [15], rate: 1/10, flip: false },
    });
    Q.stageScene("level1");
	Q.stageScene('hud', 3, Q('Player').first().p);
  
});


});
