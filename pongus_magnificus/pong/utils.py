def win_to_loss_ratio(matches_won, matches_lost):
	if matches_lost == 0:
		return matches_won
	if matches_lost == 0:
		return matches_won
	return round(matches_won / matches_lost, 2)
