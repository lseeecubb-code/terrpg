extends Node2D

const WORLD_SCENE := preload("res://scripts/world.gd")
const PLAYER_SCENE := preload("res://scripts/player.gd")

var world: Node2D
var player: CharacterBody2D

func _ready() -> void:
    var menu := get_node("MainMenu")
    menu.play_pressed.connect(_start_selected_world)

func _start_selected_world(world_seed: int, character_name: String, world_name: String) -> void:
    if is_instance_valid(world):
        world.queue_free()
    if is_instance_valid(player):
        player.queue_free()

    world = WORLD_SCENE.new()
    world.name = "World"
    add_child(world)
    world.generate(world_seed)
    world.queue_redraw()
    world.build_surface_collision(self)

    player = PLAYER_SCENE.new()
    player.name = "Player"
    player.position = Vector2(220.0, world.heights[7] * world.TILE_SIZE - 80.0)
    add_child(player)

    var collider := CollisionShape2D.new()
    var capsule := CapsuleShape2D.new()
    capsule.radius = 11.0
    capsule.height = 48.0
    collider.shape = capsule
    collider.position = Vector2(0, -4)
    player.add_child(collider)

    var camera := Camera2D.new()
    camera.name = "Camera"
    camera.position_smoothing_enabled = true
    camera.position_smoothing_speed = 7.0
    camera.limit_left = 0
    camera.limit_top = 0
    camera.limit_right = world.WORLD_WIDTH * world.TILE_SIZE
    camera.limit_bottom = world.WORLD_HEIGHT * world.TILE_SIZE
    player.add_child(camera)

    var label := Label.new()
    label.text = character_name + " — " + world_name + "  •  A/D to move • Space to jump"
    label.position = Vector2(20, 18)
    label.add_theme_font_size_override("font_size", 18)
    label.z_index = 100
    add_child(label)
