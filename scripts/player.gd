extends CharacterBody2D

@export var move_speed := 240.0
@export var acceleration := 1400.0
@export var friction := 1800.0
@export var jump_velocity := -520.0

const GRAVITY := 1350.0
const TILE_SIZE := 32.0
const SPRITE_FRAME_SIZE := Vector2(20.0, 30.0)
const SPRITE_SCALE := Vector2(3.2, 3.2)

var sprite: AnimatedSprite2D

func _ready() -> void:
    _setup_animated_sprite()

func _physics_process(delta: float) -> void:
    var direction := Input.get_axis("move_left", "move_right")

    if direction != 0.0:
        velocity.x = move_toward(velocity.x, direction * move_speed, acceleration * delta)
        sprite.flip_h = direction < 0.0
    else:
        velocity.x = move_toward(velocity.x, 0.0, friction * delta)

    if not is_on_floor():
        velocity.y += GRAVITY * delta

    if is_on_floor() and Input.is_action_just_pressed("jump"):
        velocity.y = jump_velocity

    move_and_slide()
    global_position.x = clampf(global_position.x, TILE_SIZE, 220.0 * TILE_SIZE - TILE_SIZE)
    _update_animation(direction)

func _setup_animated_sprite() -> void:
    sprite = AnimatedSprite2D.new()
    sprite.name = "PlayerSprite"
    sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
    sprite.scale = SPRITE_SCALE
    sprite.position = Vector2(0.0, -8.0)
    sprite.centered = true

    var texture := load("res://assets/player_sprites.png") as Texture2D
    var frames := SpriteFrames.new()
    frames.remove_animation("default")

    frames.add_animation("idle")
    frames.set_animation_loop("idle", true)
    frames.set_animation_speed("idle", 1.0)
    frames.add_frame("idle", _make_frame(texture, 0))

    frames.add_animation("walk")
    frames.set_animation_loop("walk", true)
    frames.set_animation_speed("walk", 9.0)
    for frame_index in range(5, 19):
        frames.add_frame("walk", _make_frame(texture, frame_index))

    frames.add_animation("air")
    frames.set_animation_loop("air", true)
    frames.set_animation_speed("air", 1.0)
    frames.add_frame("air", _make_frame(texture, 2))

    sprite.sprite_frames = frames
    sprite.animation = "idle"
    add_child(sprite)

func _make_frame(texture: Texture2D, frame_index: int) -> AtlasTexture:
    var atlas := AtlasTexture.new()
    atlas.atlas = texture
    atlas.region = Rect2(frame_index * SPRITE_FRAME_SIZE.x, 0.0, SPRITE_FRAME_SIZE.x, SPRITE_FRAME_SIZE.y)
    return atlas

func _update_animation(direction: float) -> void:
    if not is_on_floor():
        sprite.play("air")
    elif absf(velocity.x) > 12.0 or absf(direction) > 0.0:
        sprite.play("walk")
    else:
        sprite.play("idle")

func _draw() -> void:
    # Tiny translucent origin marker; the real player art is the spritesheet.
    draw_circle(Vector2.ZERO, 2.0, Color(1.0, 1.0, 1.0, 0.25))
