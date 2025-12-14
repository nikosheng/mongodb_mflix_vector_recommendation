async function test() {
  try {
    const response = await fetch('http://localhost:5000/api/movies/cold-start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: "I want to display 70% of prioritized movie to be show in the landing page, and those movie is casting by Hong Kong actors"
      })
    });
    
    const data = await response.json();
    console.log("Config:", data.meta.config);
    console.log("Counts:", data.meta.counts);
    console.log("First 5 movies:");
    data.movies.slice(0, 5).forEach(m => {
        console.log(`- ${m.title} (Promoted: ${m.promotion})`);
    });

  } catch (error) {
    console.error("Error:", error);
  }
}

test();
