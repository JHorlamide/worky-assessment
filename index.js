/**
In the JavaScript file, write a program to perform a GET request on 
the route https://coderbyte.com/api/challenges/json/age-counting which
contains a data key and the value is a string which contains items in the 
format: key=STRING, age=INTEGER. Your goal is to count how many items exist
that have an age equal to 32. Then you should create a write stream to a
file called output.txt and the contents should be the key values (from the json)
each on a separate line in the order they appeared in the json file (the file should end with a newline character on its own line).
Finally, then output the SHA1 hash of the file.

Example Input:
{
  "data": "key=IAfpK, age=32, 
          key=WNVdi, age=64, 
          key=jp9zt, age=40, 
          key=9snd2, age=32"
}

File Contents (output.txt)
IAfpK
9snd2

Example Output:
7caa78c7180ea52e5193d2b4c22e5e8a9e03b486
*/

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