const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const TOP_BOUNDARY = 92;
const BOTTOM_BOUNDARY = 628;
const PLAYER_X = 220;

export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {}

    create() {
        this.speed = 340;
        this.distance = 0;
        this.coinScore = 0;
        this.isGameOver = false;
        this.deathReason = '';
        this.activePickupLabel = '';
        this.floorIsLava = false;
        this.lavaTimer = 0;
        this.rocketSalvo = false;
        this.rocketSalvoTimer = 0;
        this.damageLevel = 0;
        this.damageResetTimer = 0;
        this.invulnerableTimer = 0;
        this.nextZapperAt = 0;
        this.nextMissileAt = 0;
        this.nextPickupAt = 0;
        this.missileWarnings = [];

        this.createTextures();
        this.createBackground();
        this.createBounds();
        this.createPlayer();
        this.createGroups();
        this.createHud();
        this.createInput();
        this.resetSpawnTimers();
    }

    createTextures() {
        const pixel = (graphics, x, y, w, h, color, size = 4) => {
            graphics.fillStyle(color, 1);
            graphics.fillRect(x * size, y * size, w * size, h * size);
        };

        if (!this.textures.exists('bg-grid')) {
            const graphics = this.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(0x14142b, 1);
            graphics.fillRect(0, 0, 64, 64);
            graphics.fillStyle(0x1d203c, 1);
            graphics.fillRect(0, 0, 64, 6);
            graphics.fillRect(0, 30, 64, 4);
            graphics.fillRect(0, 60, 64, 4);
            graphics.fillStyle(0x24284a, 1);
            graphics.fillRect(20, 6, 4, 58);
            graphics.fillRect(44, 6, 4, 58);
            graphics.fillStyle(0x0d0f22, 1);
            graphics.fillRect(0, 34, 64, 2);
            graphics.generateTexture('bg-grid', 64, 64);
            graphics.destroy();
        }

        if (!this.textures.exists('wall-panel')) {
            const graphics = this.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(0x30375e, 1);
            graphics.fillRect(0, 0, 96, 32);
            graphics.fillStyle(0x48548b, 1);
            graphics.fillRect(0, 0, 96, 4);
            graphics.fillRect(0, 28, 96, 4);
            graphics.fillStyle(0x24294a, 1);
            graphics.fillRect(8, 6, 18, 20);
            graphics.fillRect(36, 6, 24, 20);
            graphics.fillRect(70, 6, 18, 20);
            graphics.fillStyle(0x8ea3ff, 1);
            graphics.fillRect(42, 10, 12, 4);
            graphics.fillRect(42, 18, 12, 4);
            graphics.generateTexture('wall-panel', 96, 32);
            graphics.destroy();
        }

        if (!this.textures.exists('player')) {
            const graphics = this.make.graphics({ x: 0, y: 0, add: false });
            pixel(graphics, 0, 4, 12, 8, 0x4a5fcf);
            pixel(graphics, 2, 2, 5, 3, 0xf6d3a7);
            pixel(graphics, 7, 2, 3, 2, 0x2b2f4d);
            pixel(graphics, 10, 5, 4, 2, 0xf0a63a);
            pixel(graphics, 12, 5, 2, 4, 0xffe066);
            pixel(graphics, 4, 12, 5, 2, 0x2b2f4d);
            pixel(graphics, 4, 14, 2, 2, 0x8dd7ff);
            pixel(graphics, 8, 14, 2, 2, 0x8dd7ff);
            graphics.generateTexture('player', 56, 64);
            graphics.destroy();
        }

        if (!this.textures.exists('coin')) {
            const graphics = this.make.graphics({ x: 0, y: 0, add: false });
            pixel(graphics, 2, 0, 4, 1, 0xfff2a8);
            pixel(graphics, 1, 1, 6, 1, 0xffd95e);
            pixel(graphics, 0, 2, 8, 4, 0xf2b632);
            pixel(graphics, 1, 6, 6, 1, 0xffd95e);
            pixel(graphics, 2, 7, 4, 1, 0xfff2a8);
            pixel(graphics, 3, 2, 2, 4, 0xfff2a8);
            graphics.generateTexture('coin', 32, 32);
            graphics.destroy();
        }

        if (!this.textures.exists('zapper')) {
            const graphics = this.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(0x5ee7ff, 1);
            graphics.fillRect(0, 0, 20, 64);
            graphics.fillStyle(0x0d1b35, 1);
            graphics.fillRect(6, 0, 8, 64);
            graphics.fillStyle(0xb7fbff, 1);
            graphics.fillRect(2, 8, 16, 4);
            graphics.fillRect(2, 24, 16, 4);
            graphics.fillRect(2, 40, 16, 4);
            graphics.fillRect(2, 56, 16, 4);
            graphics.fillStyle(0xd5a646, 1);
            graphics.fillRect(0, 0, 20, 8);
            graphics.fillRect(0, 56, 20, 8);
            graphics.generateTexture('zapper', 20, 64);
            graphics.destroy();
        }

        if (!this.textures.exists('missile')) {
            const graphics = this.make.graphics({ x: 0, y: 0, add: false });
            pixel(graphics, 0, 2, 10, 4, 0xcd4154);
            pixel(graphics, 2, 1, 6, 1, 0xffd4dc);
            pixel(graphics, 10, 3, 2, 2, 0xe9edf7);
            pixel(graphics, 3, 6, 4, 1, 0xffb14a);
            pixel(graphics, 1, 6, 2, 1, 0xff7a33);
            graphics.generateTexture('missile', 48, 28);
            graphics.destroy();
        }

        if (!this.textures.exists('warning')) {
            const graphics = this.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(0x431218, 1);
            graphics.fillRect(0, 0, 44, 44);
            graphics.fillStyle(0xff4d5e, 1);
            graphics.fillRect(16, 6, 12, 22);
            graphics.fillRect(16, 32, 12, 6);
            graphics.generateTexture('warning', 44, 44);
            graphics.destroy();
        }

        if (!this.textures.exists('lava-strip')) {
            const graphics = this.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(0x70210f, 1);
            graphics.fillRect(0, 0, 96, 32);
            graphics.fillStyle(0xd34914, 1);
            graphics.fillRect(0, 8, 96, 24);
            graphics.fillStyle(0xff8421, 1);
            graphics.fillRect(0, 12, 96, 12);
            graphics.fillStyle(0xffd04c, 1);
            graphics.fillRect(6, 14, 12, 6);
            graphics.fillRect(30, 10, 10, 8);
            graphics.fillRect(54, 15, 14, 6);
            graphics.fillRect(78, 11, 12, 8);
            graphics.generateTexture('lava-strip', 96, 32);
            graphics.destroy();
        }

        if (!this.textures.exists('pickup-lava')) {
            const graphics = this.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(0x572214, 1);
            graphics.fillRect(0, 0, 40, 40);
            graphics.fillStyle(0xffcf4a, 1);
            graphics.fillRect(10, 6, 20, 8);
            graphics.fillRect(8, 14, 24, 8);
            graphics.fillRect(12, 22, 16, 10);
            graphics.fillStyle(0xff7c1f, 1);
            graphics.fillRect(14, 8, 12, 20);
            graphics.fillStyle(0xfff0a3, 1);
            graphics.fillRect(18, 10, 4, 12);
            graphics.generateTexture('pickup-lava', 40, 40);
            graphics.destroy();
        }

        if (!this.textures.exists('pickup-rocket')) {
            const graphics = this.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(0x1f2444, 1);
            graphics.fillRect(0, 0, 40, 40);
            graphics.fillStyle(0xd94757, 1);
            graphics.fillRect(8, 16, 18, 8);
            graphics.fillRect(24, 18, 8, 4);
            graphics.fillStyle(0xffd6de, 1);
            graphics.fillRect(10, 14, 12, 2);
            graphics.fillStyle(0xffbf57, 1);
            graphics.fillRect(6, 18, 2, 4);
            graphics.fillRect(4, 19, 2, 2);
            graphics.fillStyle(0x8dd7ff, 1);
            graphics.fillRect(14, 18, 4, 4);
            graphics.generateTexture('pickup-rocket', 40, 40);
            graphics.destroy();
        }
    }

    createBackground() {
        this.background = this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 'bg-grid');
        this.background.setScrollFactor(0);

        this.ceiling = this.add.tileSprite(GAME_WIDTH / 2, TOP_BOUNDARY / 2, GAME_WIDTH, TOP_BOUNDARY, 'wall-panel');
        this.floor = this.add.tileSprite(GAME_WIDTH / 2, BOTTOM_BOUNDARY + (GAME_HEIGHT - BOTTOM_BOUNDARY) / 2, GAME_WIDTH, GAME_HEIGHT - BOTTOM_BOUNDARY, 'wall-panel');
        this.lava = this.add.tileSprite(GAME_WIDTH / 2, BOTTOM_BOUNDARY + 18, GAME_WIDTH, 36, 'lava-strip');
        this.lava.setVisible(false);
        this.lava.setDepth(2);
        this.lavaGlow = this.add.rectangle(GAME_WIDTH / 2, BOTTOM_BOUNDARY - 6, GAME_WIDTH, 20, 0xffa12e, 0.28);
        this.lavaGlow.setVisible(false);
        this.lavaGlow.setDepth(2);

        const guide = this.add.graphics();
        guide.fillStyle(0x6ef0ff, 0.14);
        for (let x = 0; x < GAME_WIDTH; x += 80) {
            guide.fillRect(x, TOP_BOUNDARY, 6, BOTTOM_BOUNDARY - TOP_BOUNDARY);
        }
    }

    createBounds() {
        this.topCollider = this.add.rectangle(GAME_WIDTH / 2, TOP_BOUNDARY / 2, GAME_WIDTH, TOP_BOUNDARY);
        this.bottomCollider = this.add.rectangle(GAME_WIDTH / 2, BOTTOM_BOUNDARY + (GAME_HEIGHT - BOTTOM_BOUNDARY) / 2, GAME_WIDTH, GAME_HEIGHT - BOTTOM_BOUNDARY);
        this.topCollider.setVisible(false);
        this.bottomCollider.setVisible(false);
        this.physics.add.existing(this.topCollider, true);
        this.physics.add.existing(this.bottomCollider, true);
    }

    createPlayer() {
        this.player = this.physics.add.sprite(PLAYER_X, GAME_HEIGHT / 2, 'player');
        this.player.setCollideWorldBounds(false);
        this.player.body.setAllowGravity(false);
        this.player.body.setSize(42, 48);
        this.player.body.setOffset(6, 8);
        this.player.setDepth(3);
        this.player.alive = true;
        this.playerFlame = this.add.graphics();

        this.physics.add.collider(this.player, this.topCollider);
        this.physics.add.collider(this.player, this.bottomCollider);
    }

    createGroups() {
        this.hazards = this.physics.add.group({ allowGravity: false, immovable: true });
        this.coins = this.physics.add.group({ allowGravity: false, immovable: true });
        this.missiles = this.physics.add.group({ allowGravity: false, immovable: true });
        this.pickups = this.physics.add.group({ allowGravity: false, immovable: true });

        this.physics.add.overlap(this.player, this.hazards, (_, hazard) => this.hitHazard(hazard), null, this);
        this.physics.add.overlap(this.player, this.missiles, (_, missile) => this.hitHazard(missile), null, this);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
        this.physics.add.overlap(this.player, this.pickups, this.collectPickup, null, this);
    }

    createHud() {
        const hudStyle = {
            fontFamily: 'monospace',
            fontSize: '28px',
            color: '#f6f1cf'
        };

        this.scoreText = this.add.text(36, 28, 'DIST 0000', hudStyle).setDepth(5);
        this.coinText = this.add.text(36, 62, 'COINS 00', hudStyle).setDepth(5);
        this.pickupText = this.add.text(36, 96, '', hudStyle).setDepth(5);
        this.helpText = this.add.text(
            GAME_WIDTH / 2,
            36,
            'SPACE OR LEFT CLICK TO FLY',
            { fontFamily: 'monospace', fontSize: '24px', color: '#8dd7ff' }
        ).setOrigin(0.5, 0).setDepth(5);

        this.gameOverText = this.add.text(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            'RUN OVER\nCAUSE: -\nPRESS SPACE OR CLICK TO RESTART',
            { fontFamily: 'monospace', fontSize: '32px', color: '#fff2c7', align: 'center' }
        ).setOrigin(0.5).setDepth(6).setVisible(false);
    }

    createInput() {
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                if (this.isGameOver) {
                    this.scene.restart();
                }
            }
        });
    }

    resetSpawnTimers() {
        this.nextZapperAt = 180;
        this.nextMissileAt = 360;
        this.nextPickupAt = 900;
    }

    update(_, delta) {
        const dt = delta / 1000;

        if (this.isGameOver) {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.scene.restart();
            }
            return;
        }

        this.scrollBackground(dt);
        this.speed += dt * 2.5;
        this.distance += dt * this.speed * 0.1;

        this.handleFlight();
        this.updateLavaState(dt);
        this.updateRocketSalvoState(dt);
        this.updateDamageState(dt);
        this.updatePlayerEffects();
        this.advanceEntities(dt);
        this.handleSpawns(dt);
        this.updateHud();
    }

    scrollBackground(dt) {
        this.background.tilePositionX += this.speed * dt * 0.22;
        this.ceiling.tilePositionX += this.speed * dt * 0.7;
        this.floor.tilePositionX += this.speed * dt * 0.7;
        if (this.floorIsLava) {
            this.lava.tilePositionX += this.speed * dt;
        }
    }

    handleFlight() {
        const thrusting = this.spaceKey.isDown || this.input.activePointer.leftButtonDown();
        const body = this.player.body;

        body.velocity.y += thrusting ? -38 : 30;
        body.velocity.y = Phaser.Math.Clamp(body.velocity.y, -420, 520);

        if (this.player.y <= TOP_BOUNDARY + 30 && body.velocity.y < 0) {
            body.velocity.y = 0;
        }

        if (this.player.y >= BOTTOM_BOUNDARY - 30 && body.velocity.y > 0) {
            body.velocity.y = 0;
        }

        this.player.setAngle(Phaser.Math.Linear(this.player.angle, thrusting ? -18 : 20, 0.18));
    }

    updatePlayerEffects() {
        const body = this.player.body;
        this.playerFlame.clear();

        if (this.isGameOver || body.velocity.y > 120) {
            return;
        }

        this.playerFlame.fillStyle(0xfff08a, 1);
        this.playerFlame.fillRect(this.player.x - 30, this.player.y + 6, 12, 8);
        this.playerFlame.fillStyle(0xff8d3b, 1);
        this.playerFlame.fillRect(this.player.x - 42, this.player.y + 8, 12, 4);
        this.playerFlame.fillStyle(0xff5533, 1);
        this.playerFlame.fillRect(this.player.x - 48, this.player.y + 9, 8, 2);
    }

    handleSpawns(dt) {
        this.nextZapperAt -= this.speed * dt;
        this.nextMissileAt -= this.speed * dt;
        this.nextPickupAt -= this.speed * dt;

        if (this.nextZapperAt <= 0) {
            this.spawnZapperGate();
            this.nextZapperAt = Phaser.Math.Between(280, 380);
        }

        if (this.nextMissileAt <= 0) {
            this.spawnMissileWarning();
            this.nextMissileAt = this.rocketSalvo
                ? Phaser.Math.Between(156, 220)
                : Phaser.Math.Between(780, 1100);
        }

        if (this.nextPickupAt <= 0) {
            this.spawnPickup();
            this.nextPickupAt = Phaser.Math.Between(1600, 2200);
        }
    }

    updateLavaState(dt) {
        if (!this.floorIsLava) {
            return;
        }

        this.lavaTimer -= dt;
        this.lava.setVisible(true);
        this.lavaGlow.setVisible(true);
        this.lava.alpha = 0.82 + Math.sin(this.time.now * 0.02) * 0.12;
        this.lavaGlow.alpha = 0.18 + Math.sin(this.time.now * 0.025) * 0.08;

        if (this.player.y >= BOTTOM_BOUNDARY - 30 && this.player.body.velocity.y >= 0) {
            this.hitHazard({ hazardType: 'lava' });
            return;
        }

        if (this.lavaTimer <= 0) {
            this.floorIsLava = false;
            this.activePickupLabel = '';
            this.lava.setVisible(false);
            this.lavaGlow.setVisible(false);
        }
    }

    updateRocketSalvoState(dt) {
        if (!this.rocketSalvo) {
            return;
        }

        this.rocketSalvoTimer -= dt;

        if (this.rocketSalvoTimer <= 0) {
            this.rocketSalvo = false;
            this.rocketSalvoTimer = 0;
            this.activePickupLabel = '';
        }
    }

    updateDamageState(dt) {
        if (this.invulnerableTimer > 0) {
            this.invulnerableTimer -= dt;
            this.player.alpha = Math.sin(this.time.now * 0.04) > 0 ? 0.35 : 1;

            if (this.invulnerableTimer <= 0) {
                this.invulnerableTimer = 0;
                this.player.alpha = 1;
            }
        }

        if (this.damageLevel > 0) {
            this.damageResetTimer -= dt;

            if (this.damageResetTimer <= 0) {
                this.damageLevel = 0;
                this.damageResetTimer = 0;
                this.player.clearTint();
                this.player.alpha = 1;
            }
        }
    }

    spawnZapperGate() {
        const spawnX = GAME_WIDTH + 120;
        const variant = Phaser.Math.Between(0, 2);
        const height = Phaser.Math.Between(170, 290);

        if (variant === 0) {
            const centerY = TOP_BOUNDARY + height / 2;
            const safeCenterY = Phaser.Math.Clamp(
                TOP_BOUNDARY + height + 110,
                TOP_BOUNDARY + 110,
                BOTTOM_BOUNDARY - 110
            );

            this.spawnZapperSegment(spawnX, centerY, height);
            this.spawnCoinLine(spawnX + 24, safeCenterY, false);
            return;
        }

        if (variant === 1) {
            const centerY = BOTTOM_BOUNDARY - height / 2;
            const safeCenterY = Phaser.Math.Clamp(
                BOTTOM_BOUNDARY - height - 110,
                TOP_BOUNDARY + 110,
                BOTTOM_BOUNDARY - 110
            );

            this.spawnZapperSegment(spawnX, centerY, height);
            this.spawnCoinLine(spawnX + 24, safeCenterY, true);
            return;
        }

        const centerY = Phaser.Math.Between(TOP_BOUNDARY + 150, BOTTOM_BOUNDARY - 150);
        const rising = Phaser.Math.Between(0, 1) === 0;
        const safeCenterY = Phaser.Math.Clamp(
            centerY + (rising ? -120 : 120),
            TOP_BOUNDARY + 110,
            BOTTOM_BOUNDARY - 110
        );

        this.spawnZapperSegment(spawnX, centerY, height);
        this.spawnCoinLine(spawnX + 24, safeCenterY, rising);
    }

    spawnZapperSegment(x, y, height) {
        if (height < 60) {
            return;
        }

        const segment = this.add.rectangle(x, y, 28, height, 0x5ee7ff);
        segment.setStrokeStyle(6, 0x0d1b35, 1);
        segment.hazardType = 'zapper';
        this.physics.add.existing(segment);
        segment.body.setAllowGravity(false);
        segment.body.setImmovable(true);
        segment.body.setSize(28, height, true);
        segment.visual = this.add.image(x, y, 'zapper');
        segment.visual.setDisplaySize(20, height);
        segment.visual.setDepth(2);
        this.hazards.add(segment);
    }

    spawnCoinLine(startX, centerY, rising) {
        const count = Phaser.Math.Between(3, 5);
        const spacing = 54;
        const verticalStep = 12;
        const startY = centerY - (((count - 1) * verticalStep) / 2);

        for (let index = 0; index < count; index++) {
            const y = startY + (rising ? -index * verticalStep : index * verticalStep);
            const coin = this.coins.create(startX + index * spacing, y, 'coin');
            coin.body.setCircle(12, 4, 4);
            coin.body.setImmovable(true);
            coin.collected = false;
        }
    }

    spawnPickup() {
        const margin = 120;
        let pickupY = Phaser.Math.Between(TOP_BOUNDARY + margin, BOTTOM_BOUNDARY - margin);

        if (this.hazards.countActive(true) > 0) {
            const nearestHazard = this.hazards.getChildren()
                .filter((hazard) => hazard.active && hazard.x > GAME_WIDTH * 0.55)
                .sort((a, b) => a.x - b.x)[0];

            if (nearestHazard) {
                const topEdge = nearestHazard.y - (nearestHazard.height / 2);
                const bottomEdge = nearestHazard.y + (nearestHazard.height / 2);
                const upperLane = {
                    min: TOP_BOUNDARY + margin,
                    max: topEdge - 80
                };
                const lowerLane = {
                    min: bottomEdge + 80,
                    max: BOTTOM_BOUNDARY - margin
                };
                const validLanes = [upperLane, lowerLane].filter((lane) => lane.max > lane.min);

                if (validLanes.length > 0) {
                    const lane = validLanes[Phaser.Math.Between(0, validLanes.length - 1)];
                    pickupY = Phaser.Math.Between(Math.floor(lane.min), Math.floor(lane.max));
                }
            }
        }

        const pickup = this.pickups.create(
            GAME_WIDTH + 120,
            pickupY,
            Phaser.Math.Between(0, 1) === 0 ? 'pickup-lava' : 'pickup-rocket'
        );
        pickup.pickupType = pickup.texture.key === 'pickup-lava' ? 'floor-lava' : 'rocket-salvo';
        pickup.body.setSize(30, 30);
        pickup.body.setOffset(5, 5);
    }

    spawnMissileWarning() {
        const y = Phaser.Math.Between(TOP_BOUNDARY + 60, BOTTOM_BOUNDARY - 60);
        const warning = this.add.sprite(GAME_WIDTH - 64, y, 'warning');
        warning.setDepth(4);

        this.tweens.add({
            targets: warning,
            alpha: 0.25,
            duration: 120,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                warning.destroy();
                if (!this.isGameOver) {
                    this.spawnMissile(y);
                }
            }
        });

        this.missileWarnings.push(warning);
    }

    spawnMissile(y) {
        const missile = this.missiles.create(GAME_WIDTH + 80, y, 'missile');
        missile.hazardType = 'missile';
        missile.body.setSize(48, 20);
        missile.body.setOffset(0, 4);
        missile.body.setImmovable(true);
    }

    advanceEntities(dt) {
        const moveLeft = (group, baseSpeed) => {
            group.children.each((entity) => {
                if (!entity.active) {
                    return;
                }

                entity.x -= baseSpeed * dt;
                entity.body.reset(entity.x, entity.y);
                if (entity.visual) {
                    entity.visual.x = entity.x;
                    entity.visual.y = entity.y;
                }

                if (entity.texture?.key === 'coin') {
                    entity.angle += 180 * dt;
                }

                if (entity.x < -120) {
                    if (entity.visual) {
                        entity.visual.destroy();
                    }
                    entity.destroy();
                }
            });
        };

        moveLeft(this.hazards, this.speed);
        moveLeft(this.coins, this.speed);
        moveLeft(this.missiles, this.speed + 140);
        moveLeft(this.pickups, this.speed);

        this.missileWarnings = this.missileWarnings.filter((warning) => warning.active);
    }

    collectCoin(_, coin) {
        if (coin.collected || this.isGameOver) {
            return;
        }

        coin.collected = true;
        coin.destroy();
        this.coinScore += 1;
    }

    collectPickup(_, pickup) {
        if (this.isGameOver || !pickup.active) {
            return;
        }

        if (pickup.pickupType === 'floor-lava') {
            this.floorIsLava = true;
            this.lavaTimer = 7;
            this.activePickupLabel = 'PICKUP FLOOR IS LAVA';
            this.lava.setVisible(true);
            this.lavaGlow.setVisible(true);
        } else if (pickup.pickupType === 'rocket-salvo') {
            this.rocketSalvo = true;
            this.rocketSalvoTimer = 5;
            this.activePickupLabel = 'PICKUP ROCKET SALVO';
            this.nextMissileAt = Math.min(this.nextMissileAt, 120);
        }

        pickup.destroy();
    }

    hitHazard(hazard) {
        if (this.isGameOver) {
            return;
        }

        if (this.invulnerableTimer > 0) {
            return;
        }

        if (this.damageLevel === 0) {
            this.damageLevel = 1;
            this.damageResetTimer = 15;
            this.invulnerableTimer = 1;
            this.player.setTint(0xffd36e);
            return;
        }

        if (hazard?.hazardType === 'missile') {
            this.deathReason = 'HIT BY MISSILE';
        } else if (hazard?.hazardType === 'lava') {
            this.deathReason = 'BURNED BY LAVA';
        } else {
            this.deathReason = 'ZAPPED';
        }
        this.isGameOver = true;
        this.player.setTint(0xff8a8a);
        this.player.alpha = 1;
        this.player.body.setVelocity(0, 0);
        this.player.setAngle(90);
        this.playerFlame.clear();
        this.gameOverText.setText(`RUN OVER\nCAUSE: ${this.deathReason}\nPRESS SPACE OR CLICK TO RESTART`);
        this.gameOverText.setVisible(true);
        this.helpText.setText('PRESS SPACE OR LEFT CLICK TO RESTART');
    }

    updateHud() {
        this.scoreText.setText(`DIST ${Math.floor(this.distance).toString().padStart(4, '0')}`);
        this.coinText.setText(`COINS ${this.coinScore.toString().padStart(2, '0')}`);
        if (this.floorIsLava) {
            this.pickupText.setText(`LAVA ${Math.ceil(this.lavaTimer)}S`);
            return;
        }

        if (this.rocketSalvo) {
            this.pickupText.setText(`ROCKET SALVO ${Math.ceil(this.rocketSalvoTimer)}S`);
            return;
        }

        if (this.damageLevel > 0) {
            this.pickupText.setText(`SECOND CHANCE ${Math.ceil(this.damageResetTimer)}S`);
            return;
        }

        this.pickupText.setText(this.activePickupLabel);
    }

}
