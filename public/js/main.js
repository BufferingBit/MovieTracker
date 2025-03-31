// Main JavaScript file for the application

// Example: Movie search functionality (from profile.ejs)
document.addEventListener("DOMContentLoaded", function () {
  const movieSearchInput = document.getElementById("movieSearch");

  if (movieSearchInput) {
    movieSearchInput.addEventListener("input", async function () {
      const query = this.value;
      if (query.length < 3) return;

      const response = await fetch(`/search-movie?query=${query}`);
      const movies = await response.json();

      let suggestions = movies
        .map(
          (movie) => `
        <div class="suggestion cursor-pointer p-2 hover:bg-gray-100" 
             onclick="selectMovie('${movie.Title}', '${movie.Poster}', '${movie.imdbID}')">
          <img src="${movie.Poster}" class="w-12 inline-block mr-2">
          ${movie.Title} (${movie.Year})
        </div>
      `
        )
        .join("");

      document.getElementById("suggestions").innerHTML = suggestions;
    });
  }
});

// Function to select a movie from search results
function selectMovie(title, poster, imdbID) {
  document.getElementById("movieTitle").value = title;
  document.getElementById("moviePoster").value = poster;
  document.getElementById("movieImdbId").value = imdbID;
  document.getElementById("movieSearch").value = title;
  document.getElementById("suggestions").innerHTML = "";
}
