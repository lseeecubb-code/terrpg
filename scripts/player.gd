extends CharacterBody2D

@export var move_speed := 240.0
@export var acceleration := 1400.0
@export var friction := 1800.0
@export var jump_velocity := -520.0

const GRAVITY := 1350.0
const TILE_SIZE := 32.0

func _physics_process(delta: float) -> void:
    var direction := Input.get_axis("move_left", "move_right")
    if direction != 0.0:
        velocity.x = move_toward(velocity.x, direction * move_speed, acceleration * delta)
    else:
        velocity.x = move_toward(velocity.x, 0.0, friction * delta)

    if not is_on_floor():
        velocity.y += GRAVITY * delta
    elif Input.is_action_just_pressed("jump"):
        velocity.y = jump_velocity

    move_and_slide()
    global_position.x = clampf(global_position.x, TILE_SIZE, 220.0 * TILE_SIZE - TILE_SIZE)

func _draw() -> void:
    # Original player art: about 2 tiles wide by 3 tiles tall.
    draw_rect(Rect2(-28, -44, 56, 56), Color("#d47b42"))
    draw_rect(Rect2(-24, -68, 48, 28), Color("#e6b07a"))
    draw_rect(Rect2(-17, -58, 7, 7), Color("#222222"))
    draw_rect(Rect2(10, -58, 7, 7), Color("#222222"))
    draw_rect(Rect2(-27, 12, 23, 28), Color("#3d506b"))
    draw_rect(Rect2(4, 12, 23, 28), Color("#3d506b"))
