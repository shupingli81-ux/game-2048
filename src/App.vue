<template>
  <div class="game-container">
    <header class="header">
      <div class="title">2048</div>
      <div class="scores">
        <div class="score-box">
          <span class="score-label">分数</span>
          <span class="score-value">{{ score }}</span>
        </div>
        <div class="score-box">
          <span class="score-label">最高</span>
          <span class="score-value">{{ bestScore }}</span>
        </div>
      </div>
    </header>

    <div class="new-game-btn" @click="initGame">新游戏</div>

    <div class="grid-container" ref="gridRef" @touchstart="onTouchStart" @touchend="onTouchEnd">
      <div class="grid-background">
        <div v-for="r in 4" :key="'bg-'+r" class="grid-row">
          <div v-for="c in 4" :key="'bg-'+r+'-'+c" class="grid-cell"></div>
        </div>
      </div>

      <div class="tiles-container">
        <div
          v-for="(tile, index) in tiles"
          :key="tile.id"
          class="tile"
          :class="{
            'tile-new': tile.isNew,
            'tile-merged': tile.merged,
            [`tile-${tile.value}`]: true
          }"
          :style="tile.style"
        >
          {{ tile.value }}
        </div>
      </div>
    </div>

    <div v-if="isGameOver" class="game-over-overlay">
      <div class="game-over-content">
        <h2>游戏结束</h2>
        <p>最终得分：{{ score }}</p>
        <button @click="initGame">再来一局</button>
      </div>
    </div>

    <div v-if="won && !isGameOver" class="win-overlay">
      <div class="win-content">
        <h2>🎉 你赢了！</h2>
        <p>得分：{{ score }}</p>
        <button @click="continueGame">继续游戏</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { Game, type Direction } from './Game'
import { CELL_SIZE, CELL_GAP } from './config'

const game = new Game()
const gridRef = ref<HTMLElement | null>(null)

interface TileData {
  id: number
  value: number
  row: number
  col: number
  isNew: boolean
  merged: boolean
  style: Record<string, string>
}

let tileId = 0

const tiles = ref<TileData[]>([])
const score = computed(() => game.score)
const bestScore = computed(() => game.bestScore)
const isGameOver = computed(() => game.isGameOver)
const won = computed(() => game.won)

function initGame() {
  game.init()
  updateTiles()
}

function continueGame() {
  game.won = false
  updateTiles()
}

function updateTiles() {
  const state = game.getState()
  const newTiles: TileData[] = []
  
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const tile = state.cells[r][c]
      if (tile) {
        newTiles.push({
          id: tileId++,
          value: tile.value,
          row: tile.row,
          col: tile.col,
          isNew: tile.isNew,
          merged: !!tile.mergedFrom,
          style: {
            transform: `translate(${c * (CELL_SIZE + CELL_GAP)}px, ${r * (CELL_SIZE + CELL_GAP)}px)`,
            width: `${CELL_SIZE}px`,
            height: `${CELL_SIZE}px`
          }
        })
        tile.isNew = false
        tile.mergedFrom = null
      }
    }
  }
  
  tiles.value = newTiles
}

let touchStartX = 0
let touchStartY = 0

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

function onTouchEnd(e: TouchEvent) {
  const touchEndX = e.changedTouches[0].clientX
  const touchEndY = e.changedTouches[0].clientY
  
  const dx = touchEndX - touchStartX
  const dy = touchEndY - touchStartY
  
  const minSwipeDistance = 30
  
  if (Math.abs(dx) > Math.abs(dy)) {
    if (Math.abs(dx) > minSwipeDistance) {
      const direction: Direction = dx > 0 ? 'right' : 'left'
      if (game.move(direction)) {
        updateTiles()
      }
    }
  } else {
    if (Math.abs(dy) > minSwipeDistance) {
      const direction: Direction = dy > 0 ? 'down' : 'up'
      if (game.move(direction)) {
        updateTiles()
      }
    }
  }
}

function onKeyDown(e: KeyboardEvent) {
  const keyMap: Record<string, Direction> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right'
  }
  
  const direction = keyMap[e.key]
  if (direction && game.move(direction)) {
    updateTiles()
  }
}

onMounted(() => {
  initGame()
  window.addEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
.game-container {
  width: 100%;
  max-width: 380px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 48px;
  font-weight: bold;
  color: #776e65;
}

.scores {
  display: flex;
  gap: 10px;
}

.score-box {
  background: #bbada0;
  border-radius: 6px;
  padding: 8px 20px;
  text-align: center;
  min-width: 80px;
}

.score-label {
  display: block;
  font-size: 12px;
  color: #eee4da;
  text-transform: uppercase;
}

.score-value {
  display: block;
  font-size: 22px;
  font-weight: bold;
  color: #fff;
}

.new-game-btn {
  background: #8f7a66;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 20px;
}

.new-game-btn:hover {
  background: #9f8b77;
}

.grid-container {
  position: relative;
  background: #bbada0;
  border-radius: 8px;
  padding: 12px;
  touch-action: none;
}

.grid-background {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.grid-row {
  display: flex;
  gap: 12px;
}

.grid-cell {
  width: 80px;
  height: 80px;
  background: rgba(238, 228, 218, 0.35);
  border-radius: 6px;
}

.tiles-container {
  position: absolute;
  top: 12px;
  left: 12px;
}

.tile {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  font-size: 36px;
  font-weight: bold;
  transition: transform 100ms ease;
}

.tile-new {
  animation: pop-in 200ms ease;
}

.tile-merged {
  animation: pop 200ms ease;
}

@keyframes pop-in {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.tile-2 { background: #eee4da; color: #776e65; }
.tile-4 { background: #ede0c8; color: #776e65; }
.tile-8 { background: #f2b179; color: #f9f6f2; }
.tile-16 { background: #f59563; color: #f9f6f2; }
.tile-32 { background: #f67c5f; color: #f9f6f2; }
.tile-64 { background: #f65e3b; color: #f9f6f2; }
.tile-128 { background: #edcf72; color: #f9f6f2; font-size: 32px; }
.tile-256 { background: #edcc61; color: #f9f6f2; font-size: 32px; }
.tile-512 { background: #edc850; color: #f9f6f2; font-size: 32px; }
.tile-1024 { background: #edc53f; color: #f9f6f2; font-size: 28px; }
.tile-2048 { background: #edc22e; color: #f9f6f2; font-size: 28px; }

.game-over-overlay,
.win-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(238, 228, 218, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.game-over-content,
.win-content {
  text-align: center;
}

.game-over-content h2,
.win-content h2 {
  font-size: 48px;
  color: #776e65;
  margin-bottom: 20px;
}

.win-content h2 {
  color: #f9c74f;
}

.game-over-content p,
.win-content p {
  font-size: 20px;
  color: #776e65;
  margin-bottom: 20px;
}

.game-over-content button,
.win-content button {
  background: #8f7a66;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}
</style>
