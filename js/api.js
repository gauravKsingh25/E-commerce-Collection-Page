// Fetch data from the API
export async function fetchProducts() {
  const apiUrl =
    "https://run.mocky.io/v3/92348b3d-54f7-4dc5-8688-ec7d855b6cce?mocky-delay=500ms";
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Failed to fetch products.");
    const data = await response.json();

    // Extract the 'product' from each item in the array
    const products = data.map((item) => item.product);

    return products || []; // Return the products array (or an empty array if none found)
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}
