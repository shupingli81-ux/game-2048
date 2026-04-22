export class Tile {
  value: number
  row: number
  col: number
  mergedFrom: Tile | null = null
  isNew: boolean = false

  constructor(value: number, row: number, col: number) {
    this.value = value
    this.row = row
    this.col = col
  }
}
