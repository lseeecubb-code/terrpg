extends Node2D

const TILE_SIZE := 32
const WORLD_WIDTH := 220
const WORLD_HEIGHT := 90
const SURFACE_BASE := 34
const MIN_SURFACE := 20
const MAX_SURFACE := 48

var seed_value: int = 1337
var heights: Array[int] = []
var blocks: Array[PackedInt32Array] = []
var rng := RandomNumberGenerator.new()

func _ready() -> void:
    generate(seed_value)
    queue_redraw()

func generate(world_seed: int) -> void:
    seed_value = world_seed
    rng.seed = world_seed
    heights.clear()
    blocks.clear()

    var noise := FastNoiseLite.new()
    noise.seed = world_seed
    noise.frequency = 0.012
    noise.fractal_octaves = 4
    noise.fractal_gain = 0.55

    var detail := FastNoiseLite.new()
    detail.seed = world_seed + 9001
    detail.frequency = 0.045
    detail.fractal_octaves = 2

    for x in WORLD_WIDTH:
        var h := SURFACE_BASE + int(noise.get_noise_1d(float(x)) * 13.0 + detail.get_noise_1d(float(x)) * 4.0)
        h = clampi(h, MIN_SURFACE, MAX_SURFACE)
        heights.append(h)

    for x in WORLD_WIDTH:
        var column := PackedInt32Array()
        column.resize(WORLD_HEIGHT)
        var surface := heights[x]
        for y in WORLD_HEIGHT:
            var value := 0
            if y >= surface:
                value = 1 # dirt/stone
                if y == surface:
                    value = 2 # grass
                elif y > surface + 4:
                    value = 3 # stone

                # Carve underground pockets while keeping the upper soil intact.
                if y > surface + 7:
                    var cave := noise.get_noise_2d(float(x) * 1.35, float(y) * 1.15)
                    if cave > 0.54:
                        value = 0

                # Sparse ore patches.
                if value == 3 and y > surface + 10:
                    var ore := detail.get_noise_2d(float(x) * 2.2 + 20.0, float(y) * 2.2)
                    if ore > 0.68:
                        value = 4
            column[y] = value
        blocks.append(column)

    _add_trees()

func _add_trees() -> void:
    for x in range(4, WORLD_WIDTH - 4):
        if rng.randf() > 0.055:
            continue
        var ground := heights[x]
        if ground <= MIN_SURFACE or ground >= MAX_SURFACE - 1:
            continue
        # Tree trunks/leaves are encoded as extra block values.
        var trunk_height := rng.randi_range(4, 7)
        for y in range(ground - trunk_height, ground):
            if y >= 0:
                blocks[x][y] = 5
        var top := ground - trunk_height
        for dx in range(-2, 3):
            for dy in range(-2, 2):
                var tx := x + dx
                var ty := top + dy
                if tx >= 0 and tx < WORLD_WIDTH and ty >= 0 and ty < WORLD_HEIGHT:
                    if abs(dx) + abs(dy) <= 3 and blocks[tx][ty] == 0:
                        blocks[tx][ty] = 6

func _draw() -> void:
    draw_rect(Rect2(0, 0, WORLD_WIDTH * TILE_SIZE, WORLD_HEIGHT * TILE_SIZE), Color("#8cc9f0"))
    draw_rect(Rect2(0, 0, WORLD_WIDTH * TILE_SIZE, 170), Color("#8cc9f0"))

    for x in WORLD_WIDTH:
        for y in WORLD_HEIGHT:
            var tile := blocks[x][y]
            if tile == 0:
                continue
            var rect := Rect2(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE + 1, TILE_SIZE + 1)
            var c := Color("#795548")
            match tile:
                2: c = Color("#65a84a")
                3: c = Color("#666b70")
                4: c = Color("#b58b45")
                5: c = Color("#80542d")
                6: c = Color("#3e8743")
            draw_rect(rect, c)
            if tile in [1, 2, 3, 4]:
                draw_line(rect.position + Vector2(3, 4), rect.position + Vector2(12, 4), Color(1, 1, 1, 0.08), 1.0)

func build_surface_collision(parent: Node2D) -> void:
    # Build collision from the actual solid tiles instead of a diagonal surface polygon.
    # Adjacent solid tiles on each row are merged into rectangular colliders for efficiency.
    var body := StaticBody2D.new()
    body.name = "TerrainCollision"

    for y in WORLD_HEIGHT:
        var run_start := -1
        for x in range(WORLD_WIDTH + 1):
            var solid := false
            if x < WORLD_WIDTH:
                solid = blocks[x][y] != 0

            if solid and run_start == -1:
                run_start = x
            elif not solid and run_start != -1:
                var run_width := x - run_start
                var collider := CollisionShape2D.new()
                var rectangle := RectangleShape2D.new()
                rectangle.size = Vector2(run_width * TILE_SIZE, TILE_SIZE)
                collider.shape = rectangle
                collider.position = Vector2(
                    (run_start + run_width * 0.5) * TILE_SIZE,
                    (y + 0.5) * TILE_SIZE
                )
                body.add_child(collider)
                run_start = -1

    parent.add_child(body)
