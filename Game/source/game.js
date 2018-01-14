// Constructor
RacingGame = function()
{
	Sim.App.call(this);
}

// Subclass Sim.App
RacingGame.prototype = new Sim.App();

// Our custom initializer
RacingGame.prototype.init = function(param)
{
	// Call superclass init code to set up scene, renderer, default camera
	Sim.App.prototype.init.call(this, param);

    var thisURL = document.URL;
    if(thisURL.indexOf('?')==-1)   //默认汽车及游戏模式
	{
        modelID=0;
        modeID=6;
	}
	else
	{
		var str=thisURL.split('?')[1];
		var arr=str.split('&');
		if(arr[1]<5)
		{
            modelID=arr[1];
            modeID=arr[2];
		}
		else
		{
			modelID=0;
			modeID=arr[1];
		}
	}

    param = param || {};
	this.param = param;
	
	this.hud = param.hud;
	this.sounds = param.sounds;
	
	this.createEnvironment();   //加载环境
	this.loadCars();            //加载汽车
	this.loadRacer(modelID);           //加载玩家
	
	this.curTime = Date.now();
	this.deltat = 0;
	
	this.running = false;
	this.state = RacingGame.STATE_LOADING;	

	//获取焦点
	this.focus();

	this.addContextListener();
}

RacingGame.prototype.createEnvironment = function()
{
	this.environment = new Environment();
	this.environment.init({app:this,
		textureSky:true,
		textureGround:true,
		textureFinishLine:true,
		displaySigns:true});

	//添加环境
	this.addObject(this.environment);
}

RacingGame.prototype.loadCars = function()
{
	this.carModels = [];
	this.nMakesLoaded = 0;
	this.nMakesTotal = 3;
	
	var that = this;
	var model = new JSONModel;
	model.init(
			{
				url : "../models/Nova Car/NovaCar.js",
				callback: function(model) { that.onCarLoaded(model, "nova", 
				{
					scale:0.7, 
					position:{x:0, y:.25, z:(Car.CAR_LENGTH+1)/2},
					rotation:{x:-Math.PI / 2, y:0, z:0},
				}); }
			}				
			);

    model = new JSONModel;
	model.init(
			{
				url : "../models/Camaro-1/Camaro.js",
				callback: function(model) { that.onCarLoaded(model, "camaro", 
				{
					scale:0.17, 
					position:{x:1, y:-.5, z:Car.CAR_LENGTH/2},
					rotation:{x:-Math.PI / 2, y:0, z:0},
				}); }
			}				
			);

    model = new JSONModel;
	model.init(
			{
				url : "../models/Camaro-1/Camaro.js",
				callback: function(model) 
				{ that.onCarLoaded(model, "camaro_silver", 
				{
					scale:0.17, 
					position:{x:1, y:-.5, z: Car.CAR_LENGTH/2},
					rotation:{x:-Math.PI / 2, y:0, z:0},
					map:"../models/Camaro-1/camaro_4.jpg",
					mapIndex:0
				}); }
			}				
			);
    // model = new JSONModel;
    // model.init(
    //     {
    //         url : "../models/Nissan GTR OBJ/Objects/NissanOBJ1.js",
    //         callback: function(model)
    //         { that.onCarLoaded(model, "camaro_silver",
    //             {
    //                 scale:0.02,
    //                 position:{x:1, y:-.5, z: Car.CAR_LENGTH},
    //                 rotation:{x:-Math.PI / 2, y:0, z:0},
    //                 mapIndex:0
    //             }); }
    //     }
    // );
}

RacingGame.prototype.onCarLoaded = function(model, make, options)
{
	this.carModels[this.nMakesLoaded++] = { make: make, model : model, options : options };
	
	if (this.nMakesLoaded >= this.nMakesTotal)
	{
		this.createCars();
	}
}


RacingGame.prototype.loadRacer = function(id)
{
	var that = this;
	var model = new JSONModel;

	if(id==0)
	{
        model.init({
            url : "../models/Nissan GTR OBJ/Objects/NissanOBJ1.js",
            scale:0.02,
            callback: function(model) { that.onRacerLoaded(id,model,{}); }
        });
	}
	if(id==1)
	{
        model.init({
            url : "../models/Nova Car/NovaCar.js",
            scale:0.4,
            callback: function(model) { that.onRacerLoaded(id,model,{}); }
        });
	}
    if(id==2)
    {
        model.init({
            url : "../models/Camaro-1/Camaro.js",
            scale:0.125,
            callback: function(model) { that.onRacerLoaded(id,model,{}); }
        });
    }
    if(id==3)
    {
        model.init({
            url : "../models/Camaro-1/Camaro.js",
            scale:0.125,
            callback: function(model) { that.onRacerLoaded(id,model,
				{
                    map:"../models/Camaro-1/camaro_4.jpg",
                    mapIndex:0
				}); }
        });
    }
    if(id==4)
    {
        model.init({
            url : "../models/Camaro-1/Camaro.js",
            scale:0.125,
            callback: function(model) { that.onRacerLoaded(id,model,
				{
					map:"../models/Camaro-1/camaro_3.jpg",
                    mapIndex:0
				}); }
        });
    }
    if(id==5)
    {
        model.init({
            url : "../models/Camaro-1/Camaro.js",
            scale:0.125,
            callback: function(model) { that.onRacerLoaded(id,model,
				{
                    map:"../models/Camaro-1/camaro_2.jpg",
                    mapIndex:0
				}); }
        });
    }
}

RacingGame.prototype.onRacerLoaded = function(id,model,options)
{
	// Turn away from camera
	if(id==0)
	{
	    //放置车模型时y方向旋转角度
        model.mesh.rotation.y = Math.PI-0.07;
    }
    if(id==1)
	{
        model.mesh.rotation.x = -Math.PI/2;
        model.mesh.rotation.z = Math.PI;
    }
    if(id==2 || id==3 || id==4 ||id==5)
	{
          model.mesh.rotation.x = Math.PI/2;
          model.mesh.rotation.y = Math.PI;
          model.mesh.translateX(-0.8);
          model.mesh.translateZ(0.2);
	}

	if(options.map)
	{
        var mesh = new THREE.Mesh(model.mesh.geometry, model.mesh.material);
        var material = mesh.geometry.materials[options.mapIndex];
        material.map = THREE.ImageUtils.loadTexture(options.map);
	}
	this.player = new Player;
	this.player.init({ mesh : model.object3D, camera : camera, exhaust:true,
		sounds : this.sounds});
	this.addObject(this.player);
	this.player.setPosition(0, RacingGame.CAR_Y + Environment.GROUND_Y, 
			Environment.ROAD_LENGTH / 2 - RacingGame.PLAYER_START_Z);
	this.player.start();
	
	if (this.cars)
	{
		this.startGame();
	}
}

RacingGame.prototype.startGame = function()
{
	this.running = true;
	this.state = RacingGame.STATE_RUNNING;
	this.startTime = Date.now();
	
	if (this.sounds)
	{
		var driving = this.sounds["driving"];
		driving.loop = true;
		driving.play();

        // var bgm = this.sounds["bgm"];
        // bgm.volume -= 0.5;
        // bgm.loop = true;
        // bgm.play();
	}
}

RacingGame.prototype.finishGame = function()
{
	this.running = false;
	this.player.stop();
	
	var i, len = this.cars.length;
	for (i = 0; i < len; i++)
	{
		this.cars[i].stop();
	}
	
	this.state = RacingGame.STATE_COMPLETE;
	this.showResults();
}

RacingGame.prototype.crash = function(car)
{
	this.player.crash();
	car.crash();
	this.running = false;
	this.state = RacingGame.STATE_CRASHED;
	this.showResults();
}

RacingGame.prototype.createCars = function()
{
	this.cars = [];

	if(modeID==6)
	{
        var i = 0, nCars = 3;
        for (i = 0; i < nCars; i++)
        {
            var object = this.createCar(i % this.nMakesLoaded,0);

            var car = new Car;
            car.init({ mesh : object ,flag : 0});
            this.addObject(car);
            var randx = ( Math.random()- 0.5 ) * (Environment.ROAD_WIDTH - Car.CAR_WIDTH*1.5 ) ;
            var randz = (Math.random()) * Environment.ROAD_LENGTH / 2 - RacingGame.CAR_START_Z;
            car.setPosition(randx, RacingGame.CAR_Y + Environment.GROUND_Y, randz);

            this.cars.push(car);
            car.start();
        }

        //反向车辆
        var nrCars=2;
        var z= -(Math.random()) * Environment.ROAD_LENGTH / 4 + RacingGame.CAR_START_Z;;
        //var z = Environment.ROAD_LENGTH/2  - RacingGame.CAR_START_Z*3;
        for(i=0;i<nrCars;i++)
        {
            var object = this.createCar(i,1);
            var car= new Car;
            car.init({ mesh : object ,flag : 1 });
            this.addObject(car);
            var randx = (Math.random()-0.5) * (Environment.ROAD_WIDTH - Car.CAR_WIDTH*1.5);
            //console.log(randx);
            if(i>0) z -= (Math.random())* Environment.ROAD_LENGTH/4; //保证反向的两辆车不会重
            car.setPosition(randx, RacingGame.CAR_Y + Environment.GROUND_Y, z);
            this.cars.push(car);
            car.start();

        }
	}
	if(modeID==7)
	{
        var i = 0, nCars = 5;
        for (i = 0; i < nCars; i++)
        {
            var object = this.createCar(i % this.nMakesLoaded,0);

            var car = new Car;
            car.init({ mesh : object ,flag : 0});
            this.addObject(car);
            var randx = ( Math.random()- 0.5 ) * (Environment.ROAD_WIDTH - Car.CAR_WIDTH*1.5 ) ;
            var randz = (Math.random()) * Environment.ROAD_LENGTH / 2 - RacingGame.CAR_START_Z;
            car.setPosition(randx, RacingGame.CAR_Y + Environment.GROUND_Y, randz);

            this.cars.push(car);
            car.start();
        }

	}

	if (this.player)
	{
		this.startGame();
	}
}

RacingGame.prototype.createCar = function(makeIndex, flag)
{
	var model = this.carModels[makeIndex].model;
	var options = this.carModels[makeIndex].options;

	var group = new THREE.Object3D;
	group.rotation.y = Math.PI;
	if(flag == 1)
    {
        options.rotation.z = Math.PI;
        //options.rotation.y = Math.PI/2;
        options.position.x = 1-Car.CAR_WIDTH-0.25;//car width
        options.position.z -= Car.CAR_WIDTH;
    }
	var mesh = new THREE.Mesh(model.mesh.geometry, model.mesh.material);

	//console.log(options.rotation.x, options.rotation.y, options.rotation.z);
	mesh.rotation.set(options.rotation.x, options.rotation.y, options.rotation.z);
	mesh.scale.set(options.scale, options.scale, options.scale);
	mesh.position.set(options.position.x, options.position.y, options.position.z);

	if (options.map)
	{
		var material = mesh.geometry.materials[options.mapIndex];
		material.map = THREE.ImageUtils.loadTexture(options.map);
	}
	
	group.add(mesh);
	
	return group;
}



RacingGame.prototype.update = function()
{
	if (this.running)
	{
		this.elapsedTime = (Date.now() - this.startTime) / 1000;
		this.updateHUD();
		//console.log(Environment.ROAD_LENGTH);
		this.testCollision();
        this.moveCars();

		if (this.player.object3D.position.z < (-Environment.ROAD_LENGTH / 2 - Car.CAR_LENGTH))
		{
			this.finishGame();
		}	
	}
	
	Sim.App.prototype.update.call(this);
}

RacingGame.prototype.updateHUD = function()
{
	if (this.hud)
	{
		var kmh = this.player.speed * 3.6;  // convert m/s to km/hr
		this.hud.speedometer.update(kmh);
		
		this.hud.tachometer.update(this.player.rpm);
		
		this.hud.timer.innerHTML = "时间<br>" + this.elapsedTime.toFixed(2);

		var roadRelative = (this.player.object3D.position.z - (Environment.ROAD_LENGTH / 2) + 4);
		var distanceKm = -roadRelative / Environment.ROAD_LENGTH;
		this.hud.odometer.innerHTML = "里程<br>" + distanceKm.toFixed(2);
	}	
}
//检测路上其他车辆是否产生碰撞
RacingGame.prototype.moveCars = function()
{
    var i=0,j=3;
    for(;i<3;i++)
    {
        var car1=this.cars[i].object3D.position;
        for(j=3;j<5;j++)
        {
            var car2=this.cars[j].object3D.position;
            dist = car2.x-car1.x;
            if( Math.abs(car2.z-car1.z) < 5 * Car.CAR_LENGTH && Math.abs(dist)<Car.CAR_WIDTH && 0<dist )
            {
                //车在左边，向右移
                if( car2.x<0 ) this.cars[j].move(0.02);//Car.CAR_WIDTH-dist+1);
                else this.cars[i].move(-0.02);
            }
            if( Math.abs(car2.z-car1.z) < 5 * Car.CAR_LENGTH && Math.abs(dist)<Car.CAR_WIDTH && dist<0 )
            {
                //车在左边，向右移
                if( car1.x<0 ) this.cars[i].move(0.02);
                else this.cars[j].move(-0.02);
            }

        }
    }
}

//碰撞检测
RacingGame.prototype.testCollision = function()
{
	var playerpos = this.player.object3D.position;

	//与围栏的碰撞检测
	if (playerpos.x > (Environment.ROAD_WIDTH / 2 - (Car.CAR_WIDTH/2)))
	{
		this.player.bounce();
		this.player.object3D.position.x -= 1;
	}
	
	if (playerpos.x < -(Environment.ROAD_WIDTH / 2 - (Car.CAR_WIDTH/2)))
	{
		this.player.bounce();
		this.player.object3D.position.x += 1;
	}

	//与其他赛车的碰撞检测
	var i, len = this.cars.length;
	for (i = 0; i < len; i++)
    {
		var carpos = this.cars[i].object3D.position;
		var dist = playerpos.distanceTo(carpos);
		if (dist < RacingGame.COLLIDE_RADIUS)
		{
			this.crash(this.cars[i]);
			break;
		}
	}
}

RacingGame.prototype.showResults = function()
{
	var overlay = document.getElementById("overlay");

	var headerHtml = "?";
	var contentsHtml = "?";
	var elapsedTime = this.elapsedTime.toFixed(2);
	
	if (this.state == RacingGame.STATE_COMPLETE)
	{
		if (elapsedTime < RacingGame.best_time)
		{
			RacingGame.best_time = elapsedTime;
		}

		headerHtml = "完成比赛!";
		contentsHtml = 
			"成绩: " + elapsedTime + "s<p>最佳成绩: " + RacingGame.best_time + "s";

	}
	else if (this.state == RacingGame.STATE_CRASHED)
	{
		headerHtml = "撞击!";
		contentsHtml = 
			"撞击时间: " + elapsedTime + "s";
	}
	
	var header = document.getElementById("header");
	var contents = document.getElementById("contents");
	header.innerHTML = headerHtml;
	contents.innerHTML = contentsHtml;

	overlay.style.display = "block";    
}


RacingGame.prototype.handleKeyDown = function(keyCode, charCode)
{
	if (this.player)
	{
		this.player.handleKeyDown(keyCode, charCode);
	}
}

RacingGame.prototype.handleKeyUp = function(keyCode, charCode)
{
	if (this.player)
	{
		this.player.handleKeyUp(keyCode, charCode);
	}
}

RacingGame.prototype.restart = function(e)
{
	// Re-init the sounds
	if (this.sounds)
	{
		var driving = this.sounds["driving"];
		driving.pause();
		driving.currentTime = 0;

        // var bgm = this.sounds["bgm"];
        // bgm.volume -= 0.5;
        // bgm.pause();
        // bgm.currentTime = 0;
	}
	
	// Hide the overlay
	var overlay = document.getElementById("overlay");
	overlay.style.display = 'none';

	// Reinitialize us
	this.container.removeChild(this.renderer.domElement);
	this.init( this.param );
}

RacingGame.prototype.handleContextLost = function(e)
{
	this.restart();
}

RacingGame.prototype.addContextListener = function()
{
	var that = this;
	
	this.renderer.domElement.addEventListener("webglcontextlost", 
			function(e) { 
				that.handleContextLost(e);
				}, 
			false);
}

RacingGame.COLLIDE_RADIUS = Math.sqrt(2 * Car.CAR_WIDTH);
RacingGame.STATE_LOADING = 0;
RacingGame.STATE_RUNNING = 1;
RacingGame.STATE_COMPLETE = 2;
RacingGame.STATE_CRASHED = 3;
RacingGame.CAR_Y = .4666;
RacingGame.CAR_START_Z = 10;
RacingGame.PLAYER_START_Z = 4;
RacingGame.best_time = Number.MAX_VALUE;
