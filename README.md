# Thieves' Guild

A 2D medieval fantasy game about managing a thieves' guild built with Phaser.js.

## Game Synopsis

### **Core Concept**
- A **2D medieval fantasy game** about managing a **thieves' guild**.
- **Stealth, strategy, and resource management** are key gameplay pillars.
- The player **builds, expands, and manages** their guild while overseeing operations.

### **Visual & Animation Style**
- **Hand-drawn vector graphics** with a style inspired by *Munchkin*.
- **Sprite animations** rely on transformations:
  - Stretching, wobbling, skewing, rotating.
  - Mirroring for turning, creating a **paper cut-out** effect.

### **Gameplay Mechanics**
- **Guild Management:**
  - Recruit and train thieves.
  - Assign missions (heists, kidnappings, sabotage, spying).
  - Manage hideout upgrades and resource distribution.
- **Dynamic World Events:**
  - Economic shifts, festivals, increased patrols, rival guild conflicts.
- **Risk & Consequence System:**
  - High-risk actions increase heat; guards become more alert.
  - Losing guild members impacts operations.

### **Game Structure & Flow**
- **Open-ended gameplay** (no strict win condition).
- **Progression through influence, wealth, and reputation.**
- **Emergent gameplay** where the player's choices shape the world.
- **Seasons and world changes** affecting opportunities and risks.

### **Technology & Platform**
- **Initial POC:** A **browser-based 2D demo** using **Phaser.js**.
- **Final Game:** Aimed at **PC, macOS, Linux, and mobile devices**.
- **Minimal, touch-friendly UI** with unobtrusive menus.

## Technical Information

This is a Phaser Editor v4 project template.

### Configuration

* It is coded in JavaScript.
* It includes a VS Code project configuration (`jsconfig.json` file) and the type definitions (in the `types/` folder).

### Script Nodes

Script nodes are logic objects. You can add a script node to the scene or a game object, for extending it with custom data and behavior.

This project includes the script libraries:

- [@phaserjs/editor-scripts-base](https://github.com/phaserjs/editor-scripts-base)
