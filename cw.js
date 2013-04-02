cw = window.cw || {}; 

//Canvas Wars.
//Main game code

cw.game = (function(){
	
	//Game vars
	var canvas, 
      ctx,
      nShot = 0;
  ;
	
	//Constants
	var CANVAS_WIDTH = 800,
	    CANVAS_HEIGHT = 500,
	    FRAME_INTERVAL = 16,
	    NUM_PARTICLES = 50,
	    PARTICLE_SIZE = 15,
	    CURSOR_SIZE = 30,
	    SHOT_SPEED = 3,
	    AUTO_SHOOT_INTERVAL = 200;
	
	//Frame data
	var particles = [], ships = [], userShip, shots = [];
  
	function Shot(speed){
		this.position = new Vec2d();
		this.speed = speed;
		this.nShot = nShot++;
		this.outOfScreen = false;
	}
	
	Shot.prototype.next = function(){
		
		//if( this.speed.x == 0 ) return;
		
		if( this.position.x < 0 || this.position.x > CANVAS_WIDTH || 
		    this.position.y < 0 || this.position.y > CANVAS_HEIGHT ){
			this.outOfScreen = true;
			this.speed.x = this.speed.y = 0;
			return;
		}
		this.position.x = this.position.x + this.speed.x;
		this.position.y = this.position.y + this.speed.y;
	}
	
	//Ship 0 will be the user's ship.
	function Ship(){
		this.shootingDirection = new Vec2d(0,1);
		this.color = randomColor();
		this.position = new Vec2d();
	}
	
	Ship.prototype.shoot = function(){
		var shot = new Shot( new Vec2d( this.shootingDirection.x * SHOT_SPEED,this.shootingDirection.y * SHOT_SPEED ) );
		shot.position.setValue2d(this.position);
		shots.push(shot);
	}
	
	function Vec2d(x,y){
		this.x = x || 0;
		this.y = y || 0;
    this.diffTo = function(v){
      return{
        x: this.x - v.x,
        y: this.y - v.y
      }
    }
	}
	
	Vec2d.prototype.setValue2d = function(){
		
		if( arguments.length == 1 && arguments[0] instanceof Vec2d ){
			this.x = arguments[0].x;
			this.y = arguments[0].y;
		}
		
		if( arguments.length == 2 && typeof arguments[0] == "number" && typeof arguments[1] == "number" ){
			this.x = arguments[0];
			this.y = arguments[1];
		}

	}
	
	function Particle(){
		this.position = new Vec2d(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT);
		this.speed = new Vec2d(Math.random() * 2 - 1, Math.random() * 2 - 1);
		this.color = randomColor();
    this.hitByShot = function(shot) {
      var hitDistance = 5;
      var xdiff = this.position.x - shot.position.x;
      var ydiff = this.position.y - shot.position.y;
      xdiff = xdiff > 0 ? xdiff : -xdiff;
      ydiff = ydiff > 0 ? ydiff : -ydiff;
      return xdiff < hitDistance && ydiff < hitDistance;
    }
	}
	
	Particle.prototype.next = function(){
		this.position.x = this.position.x + this.speed.x;
		this.position.y = this.position.y + this.speed.y;
		if(this.position.x < 0 || this.position.x > CANVAS_WIDTH) this.speed.x = -this.speed.x;
		if(this.position.y < 0 || this.position.y > CANVAS_HEIGHT) this.speed.y = -this.speed.y;
	}
	
  Particle.prototype.collisionWith = function(){
    //collision detection here
  }
  
	function init(){
		
		canvas = document.getElementById('canvas');
		
		canvas.setAttribute('width', CANVAS_WIDTH);
		canvas.setAttribute('height', CANVAS_HEIGHT);
		
		ctx = canvas.getContext('2d');
		ctx.fillStyle = "#FFFFFF"; 
		
		//Initialize particles
		for(var i = 0; i < NUM_PARTICLES ; i++){
			particles.push(new Particle());
		}
		
		//Game objects init
		userShip = new Ship();
		ships.push(userShip); //Ship 0 -> user ship
		
		canvas.onmousemove = canvasMouseMove;
		canvas.onmousedown = canvasMouseDown;
		$(canvas).click(function(event){event.preventDefault();});
		
		$(document).keydown(documentKeyDown);
		$(document).keyup(documentKeyUp);
		
		setTimeout(autoShoot, AUTO_SHOOT_INTERVAL);
		
		nextFrame();
	}
	
	function autoShoot(){
		userShip.shoot();
		setTimeout(autoShoot, AUTO_SHOOT_INTERVAL);
	}
	
	function documentKeyDown(event){
		console.log("KeyDown: " + event.which);
		switch(event.which){
			case 87: //w-up
				userShip.shootingDirection.setValue2d(0,-1);
				break;
			case 65: //a-left
				userShip.shootingDirection.setValue2d(-1,0);
				break;
			case 83: //s-down
				userShip.shootingDirection.setValue2d(0,1);
				break;
			case 68: //d-right
				userShip.shootingDirection.setValue2d(1,0);
				break;
		}
	}
	
	function documentKeyUp(event){
		console.log("KeyUp: " + event.which);
	}
	
	function canvasMouseMove(e){
		var x;
		var y;
		if (e.pageX || e.pageY) {
			x = e.pageX;
			y = e.pageY;
		}
		else {
			x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
			y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
		} 
		x -= canvas.offsetLeft;
		y -= canvas.offsetTop;

		userShip.position.setValue2d(x,y);
	}
	
	function canvasMouseDown(e){
		userShip.shoot();
		console.log("shoot");
	}
	
	function nextFrame(){
		
		draw();
		
		setTimeout(nextFrame, FRAME_INTERVAL);
		
		for( var i = 0; i < NUM_PARTICLES ; i++ ){
			particles[i].next();
		}
		
		for( var shotIx in shots ){
			shots[shotIx].next();
		}
    
    //Check shots collisions
    var i, j;
    for( i = 0 ; i < shots.length ; i++){
      for ( j = 0 ; j < particles.length ; j++ ){
        if(particles[j].collisionWith(shots[i])){
        
        }
      }
    }
	}
	
	function draw(){
		
		//Clear canvas
		ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
		
		ctx.save();
		
		//Draw background
		for(var i = 0; i < NUM_PARTICLES ; i++){
			ctx.fillStyle = particles[i].color; 
			ctx.fillRect(particles[i].position.x,particles[i].position.y,PARTICLE_SIZE,PARTICLE_SIZE);
		}
		
		//Draw user ship
		ctx.fillStyle = "#FF0000"; 
		ctx.fillRect(userShip.position.x,userShip.position.y,CURSOR_SIZE,CURSOR_SIZE);
		
		//Draw shots
		for( var shotIx in shots ){
			ctx.fillStyle = "#000000"; 
			ctx.fillRect(shots[shotIx].position.x,shots[shotIx].position.y,2,2);
		}
		
		ctx.restore();
		
	}
	
	function start(){
	
	}
	
	function pause(){
	
	}
	
	function randomColor() {
		var letters = '0123456789ABCDEF'.split('');
		var color = '#';
		for (var i = 0; i < 6; i++ ) {
			color += letters[Math.round(Math.random() * 15)];
		}
		return color;
	}
	
	return{
		init:init,
		pause:pause,
		start:start
	}
	
})();