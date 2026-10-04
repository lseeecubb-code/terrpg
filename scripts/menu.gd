extends CanvasLayer

signal play_pressed(seed_value: int, character_name: String, world_name: String)
const SAVE_PATH := "user://terrpg_saves.json"
var background: ColorRect
var panel: Panel
var title: Label
var subtitle: Label
var content_title: Label
var buttons: Array[Button] = []
var selected_character := ""
var selected_world := ""
var characters: Array = []
var worlds: Array = []

func _ready() -> void:
    layer = 200
    _load_saves()
    _build_menu()
    _show_main()

func _build_menu() -> void:
    background = ColorRect.new()
    background.color = Color("#101826")
    background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    add_child(background)
    title = Label.new()
    title.text = "TERRPG"
    title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    title.position = Vector2(0, 55)
    title.size = Vector2(1280, 100)
    title.add_theme_font_size_override("font_size", 72)
    title.add_theme_color_override("font_color", Color("#f1d38a"))
    add_child(title)
    subtitle = Label.new()
    subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    subtitle.position = Vector2(0, 145)
    subtitle.size = Vector2(1280, 40)
    subtitle.add_theme_font_size_override("font_size", 18)
    subtitle.add_theme_color_override("font_color", Color("#c8d4df"))
    add_child(subtitle)
    panel = Panel.new()
    panel.position = Vector2(340, 220)
    panel.size = Vector2(600, 410)
    var style := StyleBoxFlat.new()
    style.bg_color = Color("#182333")
    style.border_color = Color("#65758a")
    style.set_border_width_all(2)
    panel.add_theme_stylebox_override("panel", style)
    add_child(panel)
    content_title = Label.new()
    content_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    content_title.position = Vector2(20, 12)
    content_title.size = Vector2(560, 32)
    content_title.add_theme_font_size_override("font_size", 22)
    panel.add_child(content_title)

func _clear() -> void:
    buttons.clear()
    for child in panel.get_children():
        if child != content_title:
            child.queue_free()

func _button(text: String, y: float, callback: Callable) -> void:
    var b := Button.new()
    b.text = text
    b.position = Vector2(30, y)
    b.size = Vector2(540, 44)
    b.add_theme_font_size_override("font_size", 22)
    var normal := StyleBoxFlat.new()
    normal.bg_color = Color("#263448")
    normal.border_color = Color("#718196")
    normal.set_border_width_all(1)
    var hover := normal.duplicate()
    hover.bg_color = Color("#3a506c")
    hover.border_color = Color("#e5d08e")
    b.add_theme_stylebox_override("normal", normal)
    b.add_theme_stylebox_override("hover", hover)
    b.add_theme_stylebox_override("pressed", hover)
    b.pressed.connect(callback)
    panel.add_child(b)
    buttons.append(b)

func _info(text: String, y: float) -> void:
    var l := Label.new()
    l.text = text
    l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    l.position = Vector2(30, y)
    l.size = Vector2(540, 90)
    l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
    l.add_theme_font_size_override("font_size", 17)
    l.add_theme_color_override("font_color", Color("#c8d4df"))
    panel.add_child(l)

func _edit(placeholder: String, y: float) -> LineEdit:
    var e := LineEdit.new()
    e.placeholder_text = placeholder
    e.position = Vector2(30, y)
    e.size = Vector2(540, 44)
    e.add_theme_font_size_override("font_size", 20)
    panel.add_child(e)
    return e

func _show_main() -> void:
    subtitle.text = "A NEW SANDBOX ADVENTURE"
    content_title.text = ""
    _clear()
    _button("Play", 65, _show_characters)
    _button("Settings", 120, _show_settings)
    _button("Credits", 175, _show_credits)
    _button("Quit", 230, Callable(self, "_quit_game"))

func _quit_game() -> void:
    get_tree().quit()

func _show_characters() -> void:
    content_title.text = "SELECT CHARACTER"
    subtitle.text = "CHOOSE A CHARACTER TO CONTINUE"
    _clear()
    if characters.is_empty():
        _info("No characters have been created yet.\nCreate your first character to begin.", 55)
        _button("Create Character", 150, _show_character_create)
        _button("Back", 205, _show_main)
        return
    var y := 55.0
    for c in characters:
        var character_name: String = str(c.get("name", "Unnamed"))
        var character_mode: String = str(c.get("mode", "Classic"))
        _button(character_name + "  •  " + character_mode, y, _select_character.bind(character_name))
        y += 52.0
    _button("New Character", y + 5, _show_character_create)
    _button("Back", y + 58, _show_main)

func _select_character(name: String) -> void:
    selected_character = name
    content_title.text = name
    subtitle.text = "CHARACTER OPTIONS"
    _clear()
    _button("Play", 65, _show_worlds)
    _button("Delete", 120, _delete_character)
    _button("Back", 175, _show_characters)

func _show_character_create() -> void:
    content_title.text = "CREATE CHARACTER"
    subtitle.text = "YOUR CHARACTER CAN TRAVEL BETWEEN WORLDS"
    _clear()
    _edit("Character name", 55)
    _button("Classic", 110, _create_character.bind("Classic"))
    _button("Journey", 165, _create_character.bind("Journey"))
    _button("Back", 220, _show_characters)
    _info("Choose a name and character mode. More appearance options can be added later.", 275)

func _create_character(mode: String) -> void:
    for child in panel.get_children():
        if child is LineEdit:
            var name_input: LineEdit = child
            var character_name: String = name_input.text.strip_edges()
            if character_name.is_empty():
                subtitle.text = "ENTER A CHARACTER NAME FIRST"
                return
            characters.append({"name": character_name, "mode": mode})
            selected_character = character_name
            _save_saves()
            _show_worlds()
            return

func _delete_character() -> void:
    for i in range(characters.size() - 1, -1, -1):
        if str(characters[i].get("name", "")) == selected_character:
            characters.remove_at(i)
    selected_character = ""
    _save_saves()
    _show_characters()

func _show_worlds() -> void:
    content_title.text = "SELECT WORLD"
    subtitle.text = "CHOOSE A WORLD FOR " + selected_character.to_upper()
    _clear()
    if worlds.is_empty():
        _info("No worlds have been created yet.\nCreate one to start your adventure.", 55)
        _button("Create World", 150, _show_world_create)
        _button("Back", 205, _show_characters)
        return
    var y := 55.0
    for w in worlds:
        var world_name: String = str(w.get("name", "World"))
        var world_size: String = str(w.get("size", "Medium"))
        var world_difficulty: String = str(w.get("difficulty", "Classic"))
        _button(world_name + "  •  " + world_size + " / " + world_difficulty, y, _select_world.bind(world_name))
        y += 52.0
    _button("New World", y + 5, _show_world_create)
    _button("Back", y + 58, _show_characters)

func _select_world(name: String) -> void:
    selected_world = name
    content_title.text = name
    subtitle.text = "WORLD OPTIONS"
    _clear()
    _button("Play", 65, _start_world)
    _button("Delete", 120, _delete_world)
    _button("Back", 175, _show_worlds)

func _show_world_create() -> void:
    content_title.text = "CREATE WORLD"
    subtitle.text = "BUILD A NEW PROCEDURAL ADVENTURE"
    _clear()
    _edit("World name", 45)
    _edit("Seed (leave blank for random)", 97)
    _button("Small", 151, _create_world.bind("Small"))
    _button("Medium", 206, _create_world.bind("Medium"))
    _button("Large", 261, _create_world.bind("Large"))
    _button("Back", 316, _show_worlds)

func _create_world(size: String) -> void:
    var edits: Array[LineEdit] = []
    for child in panel.get_children():
        if child is LineEdit:
            edits.append(child)
    if edits.is_empty():
        return
    var world_name: String = edits[0].text.strip_edges()
    if world_name.is_empty():
        world_name = "World " + str(worlds.size() + 1)
    var seed_text: String = edits[1].text.strip_edges()
    var world_seed: int = randi()
    if not seed_text.is_empty():
        world_seed = seed_text.hash()
    worlds.append({"name": world_name, "seed": world_seed, "size": size, "difficulty": "Classic"})
    selected_world = world_name
    _save_saves()
    _start_world()

func _delete_world() -> void:
    for i in range(worlds.size() - 1, -1, -1):
        if str(worlds[i].get("name", "")) == selected_world:
            worlds.remove_at(i)
    selected_world = ""
    _save_saves()
    _show_worlds()

func _start_world() -> void:
    for w in worlds:
        if str(w.get("name", "")) == selected_world:
            hide()
            play_pressed.emit(int(w.get("seed", 1337)), selected_character, selected_world)
            return

func _show_settings() -> void:
    content_title.text = "SETTINGS"
    subtitle.text = "CUSTOMIZE YOUR GAME"
    _clear()
    _button("Toggle Fullscreen", 65, _toggle_fullscreen)
    _button("Back", 120, _show_main)

func _show_credits() -> void:
    content_title.text = "CREDITS"
    subtitle.text = "ORIGINAL GAME, SYSTEMS AND ART DIRECTION"
    _clear()
    _info("TERRPG\n\nAn independent Godot sandbox adventure with original assets and systems.", 65)
    _button("Back", 210, _show_main)

func _toggle_fullscreen() -> void:
    if DisplayServer.window_get_mode() == DisplayServer.WINDOW_MODE_FULLSCREEN:
        DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
    else:
        DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)

func _load_saves() -> void:
    if not FileAccess.file_exists(SAVE_PATH):
        return
    var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
    if file == null:
        return
    var data = JSON.parse_string(file.get_as_text())
    if data is Dictionary:
        characters = data.get("characters", [])
        worlds = data.get("worlds", [])

func _save_saves() -> void:
    var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
    if file != null:
        file.store_string(JSON.stringify({"characters": characters, "worlds": worlds}))
