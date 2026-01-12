import { useEffect } from "react";

const Test = () => {
  useEffect(() => {
    const fetchData = async () => {
      const URL = process.env.NEXT_PUBLIC_API_URL + "/media/file/presentazione_VRtualize.pdf?random=" + Math.random();
      const response = await fetch(URL, {
        // mode: "no-cors",
      });
      const data = await response.json();
      console.log(data);
    };

    fetchData();
  }, []);

  return null;
};

export default Test;
