extends CanvasLayer

signal play_pressed

var background: ColorRect
var panel: Panel
var title: Label
var subtitle: Label
var content_title: Label
var buttons: Array[Button] = []
var screen := "main"

func _ready() -> void:
    layer = 200
    _build_menu()
    _show_main()

func _build_menu() -> void:
    background = ColorRect.new()
    background.color = Color("#101826")
    background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    background.mouse_filter = Control.MOUSE_FILTER_STOP
    add_child(background)

    var shade := ColorRect.new()
    shade.color = Color(0.02, 0.04, 0.08, 0.35)
    shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
    add_child(shade)

    title = Label.new()
    title.text = "TERRPG"
    title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    title.position = Vector2(0, 70)
    title.size = Vector2(1280, 100)
    title.add_theme_font_size_override("font_size", 72)
    title.add_theme_color_override("font_color", Color("#f1d38a"))
    add_child(title)

    subtitle = Label.new()
    subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    subtitle.position = Vector2(0, 160)
    subtitle.size = Vector2(1280, 40)
    subtitle.add_theme_font_size_override("font_size", 18)
    subtitle.add_theme_color_override("font_color", Color("#c8d4df"))
    add_child(subtitle)

    panel = Panel.new()
    panel.position = Vector2(390, 235)
    panel.size = Vector2(500, 390)
    var panel_style := StyleBoxFlat.new()
    panel_style.bg_color = Color("#182333")
    panel_style.border_color = Color("#65758a")
    panel_style.set_border_width_all(2)
    panel_style.corner_radius_top_left = 8
    panel_style.corner_radius_top_right = 8
    panel_style.corner_radius_bottom_left = 8
    panel_style.corner_radius_bottom_right = 8
    panel.add_theme_stylebox_override("panel", panel_style)
    add_child(panel)

    content_title = Label.new()
    content_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    content_title.position = Vector2(20, 12)
    content_title.size = Vector2(460, 32)
    content_title.add_theme_font_size_override("font_size", 20)
    content_title.add_theme_color_override("font_color", Color("#dce6f0"))
    panel.add_child(content_title)

    var version := Label.new()
    version.text = "TERRPG • Original Godot Edition"
    version.position = Vector2(0, 670)
    version.size = Vector2(1280, 30)
    version.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    version.add_theme_font_size_override("font_size", 14)
    version.add_theme_color_override("font_color", Color("#8d9aaa"))
    add_child(version)

func _clear_buttons() -> void:
    for button in buttons:
        button.queue_free()
    buttons.clear()

func _add_button(text: String, y: float, callback: Callable) -> void:
    var button := Button.new()
    button.text = text
    button.position = Vector2(30, y)
    button.size = Vector2(440, 44)
    button.focus_mode = Control.FOCUS_ALL
    button.add_theme_font_size_override("font_size", 22)

    var normal := StyleBoxFlat.new()
    normal.bg_color = Color("#263448")
    normal.border_color = Color("#718196")
    normal.set_border_width_all(1)
    normal.corner_radius_top_left = 4
    normal.corner_radius_top_right = 4
    normal.corner_radius_bottom_left = 4
    normal.corner_radius_bottom_right = 4

    var hover := normal.duplicate()
    hover.bg_color = Color("#3a506c")
    hover.border_color = Color("#e5d08e")

    button.add_theme_stylebox_override("normal", normal)
    button.add_theme_stylebox_override("hover", hover)
    button.add_theme_stylebox_override("pressed", hover)
    button.add_theme_color_override("font_color", Color("#e7edf4"))
    button.add_theme_color_override("font_hover_color", Color("#fff1b2"))
    button.pressed.connect(callback)
    panel.add_child(button)
    buttons.append(button)

func _show_main() -> void:
    screen = "main"
    subtitle.text = "A NEW SANDBOX ADVENTURE"
    content_title.text = "MAIN MENU"
    _clear_buttons()
    _add_button("Single Player", 55, _on_single_player_pressed)
    _add_button("Worlds", 110, _on_worlds_pressed)
    _add_button("Settings", 165, _on_settings_pressed)
    _add_button("Credits", 220, _on_credits_pressed)
    _add_button("Quit", 275, _on_quit_pressed)

func _show_worlds() -> void:
    screen = "worlds"
    subtitle.text = "CHOOSE AN ADVENTURE"
    content_title.text = "WORLD SELECT"
    _clear_buttons()
    _add_button("Seeded World", 55, _on_play_pressed)
    _add_button("New World", 110, _on_new_world_pressed)
    _add_button("Back", 165, _show_main)

func _show_settings() -> void:
    screen = "settings"
    subtitle.text = "CUSTOMIZE YOUR GAME"
    content_title.text = "SETTINGS"
    _clear_buttons()
    _add_button("Toggle Fullscreen", 55, _on_fullscreen_pressed)
    _add_button("Back", 110, _show_main)

func _show_credits() -> void:
    screen = "credits"
    subtitle.text = "TERRPG — ORIGINAL GAME, ASSETS AND SYSTEMS"
    content_title.text = "CREDITS"
    _clear_buttons()
    _add_button("Back", 55, _show_main)

    var info := Label.new()
    info.text = "TERRPG\n\nOriginal Godot project\nOriginal gameplay systems\nOriginal art direction\n\nBuilt as an independent sandbox adventure."
    info.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    info.position = Vector2(30, 120)
    info.size = Vector2(440, 180)
    info.add_theme_font_size_override("font_size", 17)
    info.add_theme_color_override("font_color", Color("#c8d4df"))
    panel.add_child(info)
    info.tree_exiting.connect(func() -> void: pass)

func _on_single_player_pressed() -> void:
    _show_worlds()

func _on_worlds_pressed() -> void:
    _show_worlds()

func _on_new_world_pressed() -> void:
    subtitle.text = "A NEW PROCEDURAL WORLD WILL BE CREATED"
    _on_play_pressed()

func _on_play_pressed() -> void:
    hide()
    play_pressed.emit()

func _on_fullscreen_pressed() -> void:
    if DisplayServer.window_get_mode() == DisplayServer.WINDOW_MODE_FULLSCREEN:
        DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
        subtitle.text = "WINDOWED MODE"
    else:
        DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)
        subtitle.text = "FULLSCREEN MODE"

func _on_credits_pressed() -> void:
    _show_credits()

func _on_quit_pressed() -> void:
    get_tree().quit()
