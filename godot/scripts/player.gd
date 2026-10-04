extends CharacterBody2D

@export var move_speed := 240.0
@export var acceleration := 1400.0
@export var friction := 1800.0
@export var jump_velocity := -520.0
const GRAVITY := 1350.0

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
    global_position.x = clampf(global_position.x, 24.0, 220.0 * 32.0 - 24.0)

func _draw() -> void:
    # Temporary original player art; this will become a proper sprite later.
    draw_rect(Rect2(-12, -18, 24, 30), Color("#d47b42"))
    draw_rect(Rect2(-10, -30, 20, 14), Color("#e6b07a"))
    draw_rect(Rect2(-7, -27, 4, 4), Color("#222222"))
    draw_rect(Rect2(3, -27, 4, 4), Color("#222222"))
    draw_rect(Rect2(-12, 10, 9, 10), Color("#3d506b"))
    draw_rect(Rect2(3, 10, 9, 10), Color("#3d506b"))
