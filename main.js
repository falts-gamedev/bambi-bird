const font = new Font("default");
const flappy_img = new Image("flappy.png")
const pipe_img = new Image("pipe.png")
const pipe1_img = new Image("pipe1.png")
const ground_img = new Image("ground.png")
const bg_img = new Image("background.png")
const menu = new Image("menu.png")
let pipe_timer = Timer.new()

const colors = {
    "white": Color.new(255, 255, 255),
    "black": Color.new(0, 0, 0),
    "dark_gray": Color.new(35,35,35)
}


let pad = Pads.get(0);
let show_menu = false;

let pipes_count = 0 // Conta quantos canos já foram criados, formando um ID.
let spawned_pipes = {}
let grounds_count = 3
const ground_spawn_y = 408
let spawned_grounds = {
    "ground0": {
        x: 640 - ground_img.width,
        y:ground_spawn_y,
    },
    "ground1": {
        x: 640 - ground_img.width*2,
        y:ground_spawn_y,
    },
    "ground2": {
        x: 640 - ground_img.width*3,
        y:ground_spawn_y,
    }
}

const pipe_spawn_x = 640
const pipe_spawn_y = 244
const pipe_speed = -2

let score = 0;
let flappy = { // Propriedades do flappy
    "x": 200,
    "y": 100,
    "dy": 8,
    "vy": 0,
    "width": 40,
    "height": 32,
    "angle": 0,

    "can_fall": true,
    "can_jump": true,
    "dead": false
}

function Update_Input() { // Atualiza os inputs e lê eles
    pad = Pads.get(0);

    if (pad.pressed(Pads.CROSS) && flappy.dead == false) {
        Jump();
    }
    if (pad.pressed(Pads.CROSS) == false) {
        flappy.can_jump = true;
    }

    if (pad.pressed(Pads.START) && show_menu == true) {
        Reset();
    }
    
}

function Reset() {
    for (let keys in spawned_pipes) {
        delete spawned_pipes[keys]
    }

    flappy.x = 200;
    flappy.y = 244;
    show_menu = false;
    flappy.angle = 0;
    flappy.can_fall = true;
    flappy.can_jump = true;
    flappy.dead = false;
    score = 0;
    
}

function Jump() { // Faz pular
    if (flappy.can_jump) {
        flappy.vy = -flappy.dy; 
        flappy.angle = -0.6;
        flappy.can_jump = false;
    };

}

function GetGravity() { // Faz o flappy cair, e/ou pegar gravidade
    if (flappy.can_fall) {

        const gravity = 0.5;
        flappy.vy += gravity;
        flappy.y += flappy.vy;

        if (flappy.vy > 2 && flappy.angle < 1.2) {
            flappy.angle += 0.1;
        }
        if (flappy.y >= 380) {
            Kill();
        }

    }
}

function Kill(stop = true) {
    if (stop) {
        flappy.can_fall = false;
    }
    flappy.dead = true
    if (flappy.vy > 0){flappy.vy = 0;}

    
    ShowMenu();
}

function ShowMenu() {
    show_menu = true;

}

function SpawnGround() {
    spawned_grounds[`ground${grounds_count}`] = {x: spawned_grounds[`ground${grounds_count-1}`].x - 2 + ground_img.width, y: ground_spawn_y, reproduced: false}
    grounds_count++

}
SpawnGround()

function SpawnPipe() {
    let number = Math.floor(Math.random() * 300)//+100;
    spawned_pipes[`pipe${pipes_count}`] = {"x": pipe_spawn_x  - (pipe_img.width/2), "y": (pipe_spawn_y - (pipe_img.height/2)) + number, "inverted": false, "scored": false}
    pipes_count++;
    spawned_pipes[`pipe${pipes_count}`] = {"x": pipe_spawn_x  - (pipe_img.width/2), "y": (pipe_spawn_y - (pipe_img.height/2)) + number - 450, "inverted": true, "scored": false}
    pipes_count++;
}
SpawnPipe()



while (true) {
    Screen.clear();
    Update_Input();
    GetGravity();

    bg_img.draw(0, 0, 576, 1024)
    bg_img.draw(288, 0, 576, 1024)
    bg_img.draw(576, 0, 576, 1024)

    flappy_img.width = flappy.width;
    flappy_img.height = flappy.height;
    flappy_img.angle = flappy.angle;
    flappy_img.draw(flappy.x, flappy.y)

    if (Timer.getTime(pipe_timer) >= 2000000) {
        if (!flappy.dead) {
            SpawnPipe()
        }
        Timer.reset(pipe_timer); 
    }

    for(let keys in spawned_pipes) { // Verifica colisão com os canos
        let pipe = spawned_pipes[keys]
        if (flappy.x < pipe["x"] + pipe_img.width && 
            flappy.x + flappy_img.width > pipe["x"] &&  
            flappy.y < pipe["y"] + pipe_img.height && 
            flappy.y + flappy_img.height > pipe["y"] &&
            !flappy.dead) {
            Kill(false)
        }
        if (flappy.x > pipe["x"] && pipe["scored"] == false && pipe["inverted"]) {
            score++;
            pipe["scored"] = true
        }
    }

    for(let keys in spawned_grounds) {
        let ground = spawned_grounds[keys];
        
        ground_img.draw(ground.x, ground.y)

        if (ground.x + ground_img.width <= 640 + pipe_speed && ground.reproduced == false) {
            SpawnGround()
            ground.reproduced = true
        }

        if (!flappy.dead) {ground.x += pipe_speed;}
        if (ground.x + ground_img.width < 0 ) {delete spawned_grounds[keys];} // Deleta se estiver fora da tela

    }

    for(let keys in spawned_pipes) {
        let pipe = spawned_pipes[keys];
        if (pipe["inverted"] == false) {
            pipe_img.draw(pipe["x"], pipe["y"])
        }
        else {
            pipe1_img.draw(pipe["x"], pipe["y"])
        }
        if (!flappy.dead) {pipe["x"] += pipe_speed}

        if (pipe["x"] < 0 - pipe_img.width) {delete spawned_pipes[keys];} // Deleta se estiver fora da tela
    }

        if (show_menu) {
        menu.width = 350
        menu.height = 200
        menu.draw(320 - (menu.width/2), 224 - (menu.height/2))

        const text1 = "Aperte Start para reiniciar"
        // font.print(320 /*- font.getTextSize(text1)[x]/2*/, 280, font.getTextSize(text1)[x], colors.dark_gray)

    }

    font.print(20,20,`Pontuação: ${score}`)
    Screen.flip();
}

