import { Tile } from './Tile'
import { GRID_SIZE } from './config'

export class Grid {
  cells: (Tile | null)[][]

  constructor() {
    this.cells = []
    for (let r = 0; r < GRID_SIZE; r++) {
      this.cells[r] = []
      for (let c = 0; c < GRID_SIZE; c++) {
        this.cells[r][c] = null
      }
    }
  }

  availableCells(): { row: number; col: number }[] {
    const cells: { row: number; col: number }[] = []
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!this.cells[r][c]) {
          cells.push({ row: r, col: c })
        }
      }
    }
    return cells
  }

  setTile(tile: Tile): void {
    this.cells[tile.row][tile.col] = tile
  }

  removeTile(tile: Tile): void {
    this.cells[tile.row][tile.col] = null
  }

  getTile(row: number, col: number): Tile | null {
    return this.cells[row]?.[col] ?? null
  }
}
