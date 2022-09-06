window.addEventListener("load", function() {
	var array = document.querySelectorAll("a[target='_blank'][href^='http'],[target='_blank'][href^='https']");
	array.forEach(function(item) {
		item.setAttribute("rel", "noopener noreferrer");
	});
});
