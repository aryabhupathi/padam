"""
Crossword Grid Mask & Slot Extraction
Generates 180-degree rotationally symmetric grids and extracts Across/Down slots.
"""

from typing import List, Tuple, Dict, Optional
import random

class CrosswordSlot:
    def __init__(self, slot_id: str, direction: str, start_r: int, start_c: int, length: int, cells: List[Tuple[int, int]]):
        self.slot_id = slot_id              # e.g., 'across_1', 'down_1'
        self.direction = direction          # 'across' or 'down'
        self.start_r = start_r
        self.start_c = start_c
        self.length = length
        self.cells = cells                  # [(r, c), ...]
        self.number: int = 0                # Clue number (e.g., 1, 2, 3)
        self.intersections: List[Tuple[int, 'CrosswordSlot', int]] = []  # (my_idx, other_slot, other_idx)

class GridTopology:
    def __init__(self, size: int, black_cells: List[Tuple[int, int]]):
        self.size = size
        self.black_cells = set(black_cells)
        self.slots: List[CrosswordSlot] = []
        self.cell_numbers: Dict[Tuple[int, int], int] = {}
        self._extract_slots()
        self._compute_intersections()

    def is_blocked(self, r: int, c: int) -> bool:
        if r < 0 or r >= self.size or c < 0 or c >= self.size:
            return True
        return (r, c) in self.black_cells

    def _extract_slots(self):
        """Scans the grid row-by-row to extract Across and Down slots with official numbering."""
        current_num = 1
        across_slots: List[CrosswordSlot] = []
        down_slots: List[CrosswordSlot] = []

        for r in range(self.size):
            for c in range(self.size):
                if self.is_blocked(r, c):
                    continue

                starts_across = (self.is_blocked(r, c - 1) and not self.is_blocked(r, c + 1))
                starts_down = (self.is_blocked(r - 1, c) and not self.is_blocked(r + 1, c))

                assigned_number = False
                if starts_across or starts_down:
                    self.cell_numbers[(r, c)] = current_num
                    assigned_number = True

                if starts_across:
                    cells = []
                    col_cursor = c
                    while col_cursor < self.size and not self.is_blocked(r, col_cursor):
                        cells.append((r, col_cursor))
                        col_cursor += 1
                    slot = CrosswordSlot(
                        slot_id=f"across_{current_num}",
                        direction="across",
                        start_r=r,
                        start_c=c,
                        length=len(cells),
                        cells=cells
                    )
                    slot.number = current_num
                    across_slots.append(slot)

                if starts_down:
                    cells = []
                    row_cursor = r
                    while row_cursor < self.size and not self.is_blocked(row_cursor, c):
                        cells.append((row_cursor, c))
                        row_cursor += 1
                    slot = CrosswordSlot(
                        slot_id=f"down_{current_num}",
                        direction="down",
                        start_r=r,
                        start_c=c,
                        length=len(cells),
                        cells=cells
                    )
                    slot.number = current_num
                    down_slots.append(slot)

                if assigned_number:
                    current_num += 1

        self.slots = across_slots + down_slots

    def _compute_intersections(self):
        """Finds all intersecting cell points between Across and Down slots."""
        # cell_to_slot[(r, c)] = [(slot, index_in_slot), ...]
        cell_map: Dict[Tuple[int, int], List[Tuple[CrosswordSlot, int]]] = {}
        for slot in self.slots:
            for idx, cell in enumerate(slot.cells):
                if cell not in cell_map:
                    cell_map[cell] = []
                cell_map[cell].append((slot, idx))

        for cell, slot_tuples in cell_map.items():
            if len(slot_tuples) == 2:
                (slot_a, idx_a), (slot_b, idx_b) = slot_tuples
                slot_a.intersections.append((idx_a, slot_b, idx_b))
                slot_b.intersections.append((idx_b, slot_a, idx_a))


# Balanced templates for standard sizes with 180-degree rotational symmetry
TEMPLATES = {
    5: [
        # 5x5 Template 1 (Central cross)
        [(0, 3), (0, 4), (1, 3), (1, 4), (3, 0), (3, 1), (4, 0), (4, 1)],
        # 5x5 Template 2 (Corner blocks)
        [(0, 0), (0, 4), (4, 0), (4, 4), (2, 2)],
        # 5x5 Template 3 (Compact interlocking)
        [(0, 3), (1, 3), (3, 1), (4, 1)]
    ],
    7: [
        # 7x7 Template 1
        [(0, 0), (0, 6), (6, 0), (6, 6), (1, 3), (5, 3), (3, 1), (3, 5), (3, 3)],
        # 7x7 Template 2
        [(0, 2), (0, 4), (6, 2), (6, 4), (2, 0), (4, 0), (2, 6), (4, 6), (2, 2), (4, 4)]
    ]
}

def create_grid_topology(size: int = 5, template_index: Optional[int] = None) -> GridTopology:
    """Creates a GridTopology instance of requested size."""
    if size not in TEMPLATES:
        size = 5
    options = TEMPLATES[size]
    if template_index is not None and 0 <= template_index < len(options):
        chosen_blacks = options[template_index]
    else:
        chosen_blacks = random.choice(options)
    
    return GridTopology(size, chosen_blacks)
