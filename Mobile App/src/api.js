const token = '722Q3NSN3WNVIHZ4';

async function fetchData(result = 1) {
  try {
    const url = `https://api.thingspeak.com/channels/1944978/fields/1.json?api_key=${token}&results=${result}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const parsed_response = await response.json();
    if(result > 1){
      return parsed_response["feeds"]
    }
    const {feeds} = parsed_response;
    return feeds[feeds.length-1];
  } catch (error) {
    return {};
  }
}

export {fetchData}