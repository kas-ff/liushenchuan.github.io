import { AcGameObject } from '/static/js/ac_game_object/base.js';

class Player extends AcGameObject {
    constructor(root, info) {
        super();

        this.root = root;
        this.id = info.id;
        this.x = info.x;
        this.y = info.y;
        this.width = info.width;
        this.height = info.height;
        this.color = info.color;

        this.direction = 1;     //方向

        this.vx = 0;
        this.vy = 0;

        this.speedx = 400;    //水平速度    
        this.speedy = -1500;     //跳跃初始速度

        this.gravity = 35;  //重力

        this.ctx = this.root.game_map.ctx;
        this.pressed_keys = this.root.game_map.controller.pressed_keys;

        this.status = 3;    // 0: idle, 1: 向前, 2: 向后, 3: 跳跃, 4: 攻击, 5: 受击, 6: 死亡
        this.animations = new Map();
        this.frame_current_cnt = 0;

        this.hp = 100;
        this.$hp = this.root.$kof.find(`.kof_hp_${this.id}>div`);
        this.$hp_div = this.$hp.find(`div`);
    }

    start() {

    }

    update_direction() {
        if (this.status === 6) return;

        let players = this.root.players;
        if (players[0] && players[1]) {
            let me = this, you = players[1 - this.id];
            if (me.x < you.x) me.direction = 1;
            else me.direction = -1;
        }
    }

    update_control() {
        let w, a, d, space;

        if (this.id === 0) {
            w = this.pressed_keys.has('w');
            a = this.pressed_keys.has('a');
            d = this.pressed_keys.has('d');
            space = this.pressed_keys.has(' ');
        } else {
            w = this.pressed_keys.has('ArrowUp');
            a = this.pressed_keys.has('ArrowLeft');
            d = this.pressed_keys.has('ArrowRight');
            space = this.pressed_keys.has('Enter');
        }

        if (this.status === 0 || this.status === 1 || this.status === 2) {
            if (space) {
                this.status = 4;
                this.vx = 0;
                this.frame_current_cnt = 0;
            } else if (w) {
                if (d) {
                    this.vx = this.speedx;
                } else if (a) {
                    this.vx = -this.speedx;
                } else {
                    this.vx = 0;
                }
                this.frame_current_cnt = 0;
                this.vy = this.speedy;
                this.status = 3;
            } else if (d) {
                this.vx = this.speedx;
                this.status = 1;
            } else if (a) {
                this.vx = -this.speedx;
                this.status = 2;
            } else {
                this.vx = 0;
                this.status = 0;
            }
        }
    }

    update_move() {
        this.vy += this.gravity;

        this.x += this.vx * this.timedelta / 1000;
        this.y += this.vy * this.timedelta / 1000;

        if (this.y > 450) {
            this.vy = 0;
            this.y = 450;
            if (this.status === 3) this.status = 0;
        }

        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > this.root.game_map.$canvas.width()) {
            this.x = this.root.game_map.$canvas.width() - this.width;
        }
    }

    update_attack() {

        if (this.status === 4 && this.frame_current_cnt === 55) {
            let me = this, you = this.root.players[1 - this.id];
            let r1;
            if (this.direction > 0) {
                r1 = {
                    x1: me.x + 120,
                    y1: me.y + 40,
                    x2: me.x + 120 + 105,
                    y2: me.y + 40 + 25
                };
            } else {
                r1 = {
                    x1: this.x + this.width - 225,
                    y1: this.y + 40,
                    x2: this.x + this.width - 120,
                    y2: this.y + 40 + 25
                };
            }

            let b1 = {
                x1: you.x,
                y1: you.y,
                x2: you.x + you.width,
                y2: you.y + you.height
            };

            if (this.is_collision(r1, b1)) {
                you.is_attack();
            }
        }
    }

    is_attack() {
        if (this.status === 6) return;

        this.status = 5;
        this.frame_current_cnt = 0;

        this.hp = Math.max(this.hp - 25, 0);

        this.$hp_div.animate({      //血条渐变
            width: this.$hp.parent().width() * this.hp / 100
        },300);

        this.$hp.animate({      //血条渐变
            width: this.$hp.parent().width() * this.hp / 100
        },500);

        // this.$hp.css('width',this.$hp.parent().width() * this.hp / 100);

        if (this.hp <= 0) {
            this.status = 6;
            this.frame_current_cnt = 0;
            this.vx = 0;
        }
    }

    is_collision(r1, b1) {
        if (Math.max(r1.x1, b1.x1) > Math.min(r1.x2, b1.x2)) {
            return false;
        }

        if (Math.max(r1.y1, b1.y1) > Math.min(r1.y2, b1.y2)) {
            return false;
        }

        return true;
    }

    update() {
        this.update_direction();
        this.update_control();
        this.update_attack();
        this.update_move();

        this.render();
    }

    render() {
        // this.ctx.fillStyle = this.color;
        // //左上角坐标+大小
        // this.ctx.fillRect(this.x, this.y, this.width, this.height);

        //碰撞盒子
        // this.ctx.fillStyle = 'blue';
        // this.ctx.fillRect(this.x, this.y, this.width, this.height);

        // if (this.direction > 0) {
        //     this.ctx.fillStyle = 'red';
        //     this.ctx.fillRect(this.x + 120, this.y + 40, 105, 25);
        // } else {
        //     this.ctx.fillStyle = 'red';
        //     this.ctx.fillRect(this.x + this.width - 225, this.y + 40, 105, 25);
        // }

        let status = this.status;
        let obj = this.animations.get(status);

        if (obj && obj.loaded) {

            if (this.direction > 0) {
                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
                let image = obj.gif.frames[k].image;
                this.ctx.drawImage(image, this.x, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);
            } else {
                this.ctx.save();
                this.ctx.scale(-1, 1);
                this.ctx.translate(-this.root.game_map.$canvas.width(), 0);

                let k = parseInt(this.frame_current_cnt / obj.frame_rate) % obj.frame_cnt;
                let image = obj.gif.frames[k].image;
                this.ctx.drawImage(image, this.root.game_map.$canvas.width() - this.x - this.width, this.y + obj.offset_y, image.width * obj.scale, image.height * obj.scale);

                this.ctx.restore();
            }

        }

        if (status === 4 || status === 5 || status === 6) {
            if (this.frame_current_cnt === obj.frame_rate * (obj.frame_cnt - 1)) {
                if (status === 6) {
                    this.frame_current_cnt--;
                } else {
                    this.status = 0;
                }

            }
        }

        this.frame_current_cnt++;
    }
}


export {
    Player
}