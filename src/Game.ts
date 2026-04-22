import { Grid } from './Grid'
import { Tile } from './Tile'
import { GRID_SIZE } from './config'

export type Direction = 'up' | 'down' | 'left' | 'right'

export class Game {
  grid: Grid
  score: number = 0
  bestScore: number = 0
  isGameOver: boolean = false
  won: boolean = false

  constructor() {
    this.grid = new Grid()
    this.loadBestScore()
  }

  init(): void {
    this.grid = new Grid()
    this.score = 0
    this.isGameOver = false
    this.won = false
    this.addRandomTile()
    this.addRandomTile()
  }

  addRandomTile(): void {
    const cells = this.grid.availableCells()
    if (cells.length === 0) return

    const random = cells[Math.floor(Math.random() * cells.length)]
    const value = Math.random() < 0.9 ? 2 : 4
    const tile = new Tile(value, random.row, random.col)
    tile.isNew = true
    this.grid.setTile(tile)
  }

  move(direction: Direction): boolean {
    if (this.isGameOver) return false

    const vectors = {
      up: { row: -1, col: 0 },
      down: { row: 1, col: 0 },
      left: { row: 0, col: -1 },
      right: { row: 0, col: 1 }
    }

    const vector = vectors[direction]
    let moved = false

    const traversals = this.buildTraversals(vector)

    // Reset merged flags
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const tile = this.grid.getTile(r, c)
        if (tile) tile.mergedFrom = null
      }
    }

    traversals.rows.forEach(row => {
      traversals.cols.forEach(col => {
        const tile = this.grid.getTile(row, col)
        if (!tile) return

        const { farthest, next } = this.findFarthestPosition(row, col, vector)

        if (next && this.grid.getTile(next.row, next.col)?.value === tile.value) {
          // Merge
          const merged = new Tile(tile.value * 2, next.row, next.col)
          merged.mergedFrom = [tile, this.grid.getTile(next.row, next.col)!]
          this.grid.setTile(merged)
          this.grid.removeTile(tile)
          this.score += merged.value
          if (merged.value === 2048) this.won = true
          moved = true
        } else if (farthest.row !== row || farthest.col !== col) {
          // Move
          this.grid.removeTile(tile)
          tile.row = farthest.row
          tile.col = farthest.col
          this.grid.setTile(tile)
          moved = true
        }
      })
    })

    if (moved) {
      this.addRandomTile()
      this.updateBestScore()
      if (this.checkGameOver()) {
        this.isGameOver = true
      }
    }

    return moved
  }

  private buildTraversals(vector: { row: number; col: number }) {
    const traversals = { rows: [] as number[], cols: [] as number[] }
    for (let i = 0; i < GRID_SIZE; i++) {
      traversals.rows.push(i)
      traversals.cols.push(i)
    }
    if (vector.row === 1) traversals.rows.reverse()
    if (vector.col === 1) traversals.cols.reverse()
    return traversals
  }

  private findFarthestPosition(row: number, col: number, vector: { row: number; col: number }) {
    let previous: { row: number; col: number }
    let current = { row, col }

    do {
      previous = current
      current = {
        row: previous.row + vector.row,
        col: previous.col + vector.col
      }
    } while (this.withinBounds(current) && !this.grid.getTile(current.row, current.col))

    return {
      farthest: previous,
      next: this.withinBounds(current) ? current : null
    }
  }

  private withinBounds(pos: { row: number; col: number }): boolean {
    return pos.row >= 0 && pos.row < GRID_SIZE && pos.col >= 0 && pos.col < GRID_SIZE
  }

  private checkGameOver(): boolean {
    // Check for empty cells
    if (this.grid.availableCells().length > 0) return false

    // Check for possible merges
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const tile = this.grid.getTile(r, c)
        if (!tile) continue

        // Check right
        const right = this.grid.getTile(r, c + 1)
        if (right && right.value === tile.value) return false

        // Check down
        const down = this.grid.getTile(r + 1, c)
        if (down && down.value === tile.value) return false
      }
    }

    return true
  }

  private loadBestScore(): void {
    this.bestScore = parseInt(localStorage.getItem('2048-best') || '0')
  }

  private updateBestScore(): void {
    if (this.score > this.bestScore) {
      this.bestScore = this.score
      localStorage.setItem('2048-best', this.bestScore.toString())
    }
  }

  getState(): { cells: (Tile | null)[][]; score: number; bestScore: number; isGameOver: boolean; won: boolean } {
    return {
      cells: this.grid.cells,
      score: this.score,
      bestScore: this.bestScore,
      isGameOver: this.isGameOver,
      won: this.won
    }
  }
}
