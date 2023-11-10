<div {...$$restProps}></div>

<style>
	@keyframes spin {
		0% {
			transform: rotateZ(0deg);
		}

		50% {
			transform: rotateZ(180deg);
		}

		100% {
			transform: rotateZ(360deg);
		}
	}

	div {
		animation: 2.5s linear 0s spin;
		animation-iteration-count: infinite;
		border: 4px solid var(--colour-primary);
		border-right-color: transparent;
		border-radius: 50%;
		height: 2em;
		margin: 0 auto;
		width: 2em;
	}
</style>
