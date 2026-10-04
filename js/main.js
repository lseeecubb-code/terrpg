(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ui = document.getElementById('ui');
  const errorBox = document.getElementById('error');
  const errorText = document.getElementById('errorText');
  const errorDetails = document.getElementById('errorDetails');

  function showError(message, error) {
    if (errorBox) errorBox.style.display = 'grid';
    if (errorText) errorText.textContent = message;
    if (errorDetails) errorDetails.textContent = error ? (error.stack || String(error)) : '';
    console.error(message, error || '');
  }

  window.addEventListener('error', event => {
    if (event.error) showError('A JavaScript error stopped TERRPG from starting.', event.error);
  });

  if (!canvas) return showError('The game canvas is missing from index.html.');
  if (!window.BABYLON) return showError('Babylon.js did not load. Check your internet connection and refresh the page.');
  if (!window.TERRPG_DATA) return showError('Game data did not load. Make sure js/data.js exists.');

  try {
    const engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true
    });

    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.035, 0.07, 0.13, 1);

    const camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 6, -18), scene);
    camera.setTarget(new BABYLON.Vector3(0, 2.2, 0));
    camera.minZ = 0.1;
    camera.maxZ = 500;

    const hemi = new BABYLON.HemisphericLight('sun', new BABYLON.Vector3(0, 1, 0), scene);
    hemi.intensity = 1.1;
    const key = new BABYLON.DirectionalLight('key', new BABYLON.Vector3(-0.3, -1, 0.5), scene);
    key.intensity = 0.65;

    const keys = Object.create(null);
    const monsters = [];
    const projectiles = [];
    const cooldowns = [0, 0, 0];
    let player = null;
    let last = performance.now();

    window.addEventListener('keydown', event => {
      keys[event.key.toLowerCase()] = true;
      if (['1', '2', '3'].includes(event.key)) useSkill(Number(event.key) - 1);
    });
    window.addEventListener('keyup', event => {
      keys[event.key.toLowerCase()] = false;
    });

    const material = (name, color, alpha = 1) => {
      const m = new BABYLON.StandardMaterial(name, scene);
      m.diffuseColor = BABYLON.Color3.FromHexString(color);
      m.alpha = alpha;
      return m;
    };

    const groundMat = material('ground', '#304a35');
    const stoneMat = material('stone', '#53616c');
    const playerMat = material('player', '#d6a76b');
    const skillMats = [
      material('skill1', '#f7d36b'),
      material('skill2', '#7bd1ff'),
      material('skill3', '#e9a8ff'),
      material('burst', '#e9a8ff')
    ];
    const enemyMats = {
      slime: material('slime', '#6fae59'),
      wisp: material('wisp', '#72b6e8'),
      crawler: material('crawler', '#8b715a')
    };

    function block(x, y, z, sx = 1, sy = 1, sz = 1, mat = groundMat) {
      const b = BABYLON.MeshBuilder.CreateBox('tile', {
        width: sx,
        height: sy,
        depth: sz
      }, scene);
      b.position.set(x, y, z);
      b.material = mat;
      return b;
    }

    for (let x = -90; x <= 90; x++) {
      const height = 1.7 + Math.sin(x * 0.12) * 0.45 + Math.sin(x * 0.047) * 0.8;
      for (let y = 0; y < Math.max(1, Math.floor(height)); y++) {
        block(x, y * 0.95, 0, 1, 0.95, 3, y < 1 ? groundMat : stoneMat);
      }
    }

    player = BABYLON.MeshBuilder.CreateBox('player', {
      width: 0.75,
      height: 1.5,
      depth: 0.5
    }, scene);
    player.position.set(0, 2.2, 0);
    player.material = playerMat;

    function spawnEnemy(def, x, z) {
      const enemy = BABYLON.MeshBuilder.CreateBox(def.id, {
        width: 0.8,
        height: 0.8,
        depth: 0.65
      }, scene);
      enemy.position.set(x, 2, z);
      enemy.material = enemyMats[def.id] || enemyMats.slime;
      enemy.metadata = {
        def,
        hp: def.hp,
        t: Math.random() * 6
      };
      monsters.push(enemy);
    }

    TERRPG_DATA.enemies.forEach((enemy, index) => {
      spawnEnemy(enemy, -9 + index * 9, index % 2 ? 1.8 : -1.8);
    });

    function nearestEnemy() {
      let best = null;
      let bestDistance = Infinity;
      for (const enemy of monsters) {
        if (enemy.isDisposed() || enemy.metadata.hp <= 0) continue;
        const distance = BABYLON.Vector3.Distance(enemy.position, player.position);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = enemy;
        }
      }
      return best;
    }

    function spawnBurst(position, power) {
      for (let i = 0; i < 14; i++) {
        const angle = i * Math.PI * 2 / 14;
        const projectile = BABYLON.MeshBuilder.CreateSphere('burst', {
          diameter: 0.1,
          segments: 6
        }, scene);
        projectile.position = position.clone();
        projectile.material = skillMats[3];
        projectile.metadata = {
          vx: Math.cos(angle) * 0.11,
          vz: Math.sin(angle) * 0.11,
          life: 1.2,
          power
        };
        projectiles.push(projectile);
      }
    }

    function useSkill(index) {
      if (cooldowns[index] > 0) return;
      const skill = TERRPG_DATA.skills[index];
      if (!skill) return;

      const target = nearestEnemy();
      if (!target) return;

      cooldowns[index] = skill.cooldown;

      if (skill.target === 'area') {
        for (const enemy of monsters) {
          if (!enemy.isDisposed() && BABYLON.Vector3.Distance(enemy.position, player.position) < 6) {
            enemy.metadata.hp -= skill.power;
          }
        }
        spawnBurst(player.position.clone(), skill.power);
        return;
      }

      const projectile = BABYLON.MeshBuilder.CreateSphere('skill', {
        diameter: 0.18 + index * 0.08,
        segments: 8
      }, scene);
      projectile.position = player.position.add(new BABYLON.Vector3(0, 0.15, 0));
      projectile.material = skillMats[index];
      projectile.metadata = {
        target,
        power: skill.power,
        speed: 0.22 + index * 0.04
      };
      projectiles.push(projectile);
    }

    function update(dt) {
      for (let i = 0; i < cooldowns.length; i++) {
        cooldowns[i] = Math.max(0, cooldowns[i] - dt);
      }

      const dx = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
      const dz = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
      const moveLength = Math.hypot(dx, dz);

      if (moveLength > 0) {
        const speed = TERRPG_DATA.player.speed * dt * 60;
        player.position.x += dx / moveLength * speed;
        player.position.z += dz / moveLength * speed;
      }

      player.position.x = BABYLON.Scalar.Clamp(player.position.x, -88, 88);
      player.position.z = BABYLON.Scalar.Clamp(player.position.z, -4, 4);

      camera.position.x = BABYLON.Scalar.Lerp(camera.position.x, player.position.x, Math.min(1, dt * 4));
      camera.position.z = BABYLON.Scalar.Lerp(camera.position.z, -18, Math.min(1, dt * 3));
      camera.setTarget(new BABYLON.Vector3(player.position.x, 2.2, 0));

      for (const enemy of monsters) {
        if (enemy.isDisposed()) continue;
        if (enemy.metadata.hp <= 0) {
          enemy.dispose();
          continue;
        }

        const def = enemy.metadata.def;
        const dxToPlayer = player.position.x - enemy.position.x;
        const dzToPlayer = player.position.z - enemy.position.z;
        const distance = Math.hypot(dxToPlayer, dzToPlayer) || 1;
        enemy.metadata.t += dt;

        if (def.behavior === 'orbit') {
          enemy.position.x += Math.cos(enemy.metadata.t) * 0.018;
          enemy.position.z += Math.sin(enemy.metadata.t) * 0.035;
        } else {
          enemy.position.x += dxToPlayer / distance * def.speed * dt * 60;
          enemy.position.z += dzToPlayer / distance * def.speed * dt * 60;
        }

        enemy.position.y = 1.95 + Math.abs(Math.sin(enemy.metadata.t * 4)) * (def.behavior === 'hop' ? 0.45 : 0.08);
      }

      for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        const data = projectile.metadata;

        if (data.target) {
          if (data.target.isDisposed() || data.target.metadata.hp <= 0) {
            projectile.dispose();
            projectiles.splice(i, 1);
            continue;
          }

          const velocity = data.target.position.subtract(projectile.position);
          velocity.y = 0;

          if (velocity.length() < 0.45) {
            data.target.metadata.hp -= data.power;
            projectile.dispose();
            projectiles.splice(i, 1);
            continue;
          }

          velocity.normalize();
          projectile.position.addInPlace(velocity.scale(data.speed * dt * 60));
        } else {
          projectile.position.x += data.vx * dt * 60;
          projectile.position.z += data.vz * dt * 60;
          data.life -= dt;

          if (data.life <= 0) {
            projectile.dispose();
            projectiles.splice(i, 1);
          }
        }
      }
    }

    function renderUI() {
      ui.innerHTML = `
        <div class="hud">
          <b>TERRPG</b><br>
          2.5D WebGL<br>
          WASD: Move · 1/2/3: Skills
        </div>
        <div class="skills">
          ${TERRPG_DATA.skills.map((skill, index) => `
            <div class="skill">${index + 1}<br><small>${skill.name}</small></div>
          `).join('')}
        </div>
      `;
    }

    renderUI();

    engine.runRenderLoop(() => {
      const now = performance.now();
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      update(dt);
      scene.render();
    });

    window.addEventListener('resize', () => engine.resize());
    engine.resize();
  } catch (error) {
    showError('TERRPG hit an error while creating the WebGL game.', error);
  }
})();
