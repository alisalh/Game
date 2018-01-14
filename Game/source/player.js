//定义玩家
Player = function()
{
	Car.call(this);
}

Player.prototype = new Car();   //继承于Car

Player.prototype.init = function(param)
{
	Car.prototype.init.call(this, param);

	this.camera = param.camera;
	this.speed = 0;
	this.acceleration = 0;
	this.rpm = 0;
	this.playingRevSound = false;
	this.revStartTime = 0;
	
	if (this.sounds)
	{
		this.revSound = this.sounds["rev_short"];
		this.revSoundLong = this.sounds["rev_long"];
	}
	else
	{
		this.revSound = null;
		this.revSoundLong = null;
	}

	//按键事件
	this.keysDown = [];
	this.keysDown[Sim.KeyCodes.KEY_LEFT] = false;
	this.keysDown[Sim.KeyCodes.KEY_RIGHT] = false;
	this.keysDown[Sim.KeyCodes.KEY_UP] = false;
	this.keysDown[Sim.KeyCodes.KEY_DOWN] = false;	
}

Player.prototype.updateCamera = function()
{
	var camerapos = new THREE.Vector3(Player.CAMERA_OFFSET_X,
			Player.CAMERA_OFFSET_Y, Player.CAMERA_OFFSET_Z);
	camerapos.addSelf(this.object3D.position);
	this.camera.position.copy(camerapos);
	this.camera.lookAt(this.object3D.position);   //跟随物体一起移动
	if (this.exhaust1)
	{
		this.exhaust1.object3D.rotation.x = this.camera.rotation.x;
	}
	
	if (this.exhaust2)
	{
		this.exhaust2.object3D.rotation.x = this.camera.rotation.x;
	}

}

Player.prototype.update = function()
{
	if (this.running)
	{
		if (this.crashed)
		{
			this.speed -= (1000 / 3600);
			if (this.speed < 0)
			{
				this.speed = 0;
				this.running = false;
			}

			if (this.revSound)
			{
				this.revSound.pause();
			}
			
			if (this.revSoundLong)
			{
				this.revSoundLong.pause();
			}
		}		

		var now = Date.now();
		var deltat = now - this.curTime;
		this.curTime = now;
		
		if(!this.crashed && !this.bounce_flag){
			var turning = false;
			if (this.keysDown[Sim.KeyCodes.KEY_LEFT])
			{
				Player.power = 6000;
				this.turn(-0.1);
				turning = true;
			}
			
			if (this.keysDown[Sim.KeyCodes.KEY_RIGHT])
			{
				Player.power = 6000;
				this.turn(0.1);
				turning = true;
			}

			if (!turning)
			{
				Player.power = 10000;
				this.turn(0);
			}

			//加速
			if (this.keysDown[Sim.KeyCodes.KEY_UP])
			{
				this.accelerate(0.02);
			}
			//减速
			else if (this.keysDown[Sim.KeyCodes.KEY_DOWN])
			{
				this.accelerate(-0.02);
			}	
			else
			{
				this.accelerate(-0.01);
			}
		}else if(this.crashed){
			this.turn(0)
		}

		var dist = deltat / 1000 * this.speed / this.speedFactor;
		this.object3D.position.z -= dist;
		
		this.updateCamera();
		
		if (this.speed < 0)
		{
			this.speed = 0;
		}
	}	

	Sim.Object.prototype.update.call(this);

}

//控制转动
Player.prototype.turn = function(delta)
{
	this.object3D.position.x += delta;
	if (delta < 0)
	{
		this.object3D.rotation.y = Math.PI / 12;    //左转
	}
	else if (delta > 0)
	{
		this.object3D.rotation.y = -Math.PI / 12;   //右转
	}
	else
	{
		this.object3D.rotation.y = 0;
	}
}

Player.prototype.accelerate = function(delta)
{
	//立即减速
	if (this.acceleration > 0 && delta < 0)
	{
		this.acceleration = delta;
	}
	//立即加速
	else if (this.acceleration < 0 && delta > 0)
	{
		this.acceleration = delta;
	}
	//else块内为Yu Longxin修改处
	else
	{
		if(this.rpm < 0){
			this.rpm = 0;
		}
		if(delta > 0){
			temp = Player.power / (this.speed + 1) / Player.mass
			this.acceleration = temp;
			this.rpm += temp * Player.MAX_RPM / 200;
		}else{
			this.acceleration += delta;		
			this.rpm += delta * Player.MAX_RPM;
		}
	}
	
	if (this.rpm > Player.MAX_RPM)
	{
		this.rpm = Player.MAX_RPM;
	}
	
	if (this.acceleration > Player.MAX_ACCELERATION)
	{
		this.acceleration = Player.MAX_ACCELERATION;
	}

	if (this.acceleration < -Player.MAX_ACCELERATION)
	{
		this.acceleration = -Player.MAX_ACCELERATION;
	}
	
	//计算速度
	this.speed += (this.acceleration * 1000 / 3600);
	if (this.speed < 0)
	{
		this.speed = 0;
	}
	
	if (this.speed > Player.MAX_SPEED)
	{
		this.speed = Player.MAX_SPEED;
	}
	
	
	if (this.sounds)
	{
		if (delta > 0)
		{
			if (!this.playingRevSound || (this.playingRevSound && this.revSound.ended))
			{
				this.revSound.play();
				this.playingRevSound = true;
			}
			
			if (!this.revStartTime)
			{
				this.revStartTime = Date.now();
			}
			else
			{
				var revTime = Date.now() - this.revStartTime;
				if (revTime > Player.REV_LONG_THRESHOLD)
				{
					this.revSoundLong.play();
				}
			}
		}
		else
		{
			this.revStartTIme = 0;
		}
	}
	
}


Player.prototype.handleKeyDown = function(keyCode, charCode)
{
		this.keysDown[keyCode] = true;
}

Player.prototype.handleKeyUp = function(keyCode, charCode)
{
	this.keysDown[keyCode] = false;
}

Player.MAX_SPEED = 250 * 1000 / 3600;
Player.MAX_ACCELERATION = 3;
Player.MAX_RPM = 5000;

Player.power = 10000
Player.mass = 1500

Player.CAMERA_OFFSET_X = 0;
Player.CAMERA_OFFSET_Y = 1.333;
Player.CAMERA_OFFSET_Z = 5;

Player.REV_LONG_THRESHOLD = 500;