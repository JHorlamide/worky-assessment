const https = require("https");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const url = 'https://coderbyte.com/api/challenges/json/age-counting';

function write_data_to_stream_and_log_hash(data) {
  const output_path = path.join(__dirname, "output.txt");
  const write_stream = fs.createWriteStream(output_path);

  data.forEach((value) => {
    write_stream.write(value.key + "\n");
  });

  write_stream.write("\n");
  write_stream.end();
  write_stream.on("finish", () => {
    const hash = crypto.createHash("sha1");
    const input = fs.createReadStream(output_path);
    input.pipe(hash)
    hash.on("finish", () => {
      const hash_value = hash.read().toString('hex');
      const reversed_hash_value = hash_value.split("").reverse().join("");
      console.log("HASH: ", reversed_hash_value);
    });
  })

  write_stream.on("error", (error) => {
    console.log("Error writing to file: ", error);
  });
}

https.get(url, (response) => {
  let data = '';

  response.on('data', (chunk) => {
    data += chunk;
  });

  response.on('end', () => {
    try {
      const json_data = JSON.parse(data);
      const key_value_arr = json_data.data.split(", ");

      /* First Attempt */
      // const needed_values = [];
      // for (let i = 0; i < key_value_arr.length; i++) {
      //   const [key, value] = key_value_arr[i].split("=");

      //   if (key === "age" && value === "32") {
      //     const [key_key, key] = key_value_arr[i - 1].split("=");
      //     const obj = { key, age: value };
      //     needed_values.push(obj);
      //   }
      // }

      /* Second Attempt */
      const needed_values_v2 = key_value_arr.map((item, index, array) => {
        const [key, value] = item.split("=");
        if (key === "age" && value === "32") {
          const [prev_key, prev_value] = array[index - 1].split("=");
          return { key: prev_value, age: value };
        }
        return null;
      }).filter(Boolean);

      write_data_to_stream_and_log_hash(needed_values_v2);
    } catch (error) {
      console.error("Error parsing JSON: ", error);
    }
  });
}).on("error", (error) => {
  console.error("Error fetching data: ", error);
})