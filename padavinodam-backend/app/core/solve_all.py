
# Clean solver for all regions of 12x12
import json

# Region 1: Top-Center (cols 4..7, rows 0..3)
# Across 3 (0,5..0,6): 'క', 'ళ' -> 'కళ' (Art)
# Down 3 (0,5..1,5): 'క', 'వి' -> 'కవి' (Poet)
# Down 4 (0,6..1,6): 'ళ', 'త్ర' -> 'కళత్ర' (Wife) or 'క', 'లం'
# Let's test combinations
print('Testing combinations')
