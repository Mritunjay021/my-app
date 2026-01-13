import { useState,useEffect } from "react";
import { nanoid } from "nanoid";

const ANIMAL=["Lion","Tiger","Bear","Wolf","Fox","Eagle","Hawk","Shark","Dolphin","Whale","Panda","Koala","Giraffe","Zebra","Elephant","Cheetah","Leopard","Jaguar","Cougar","Lynx","Otter"];

const STORAGE_KEY="chat_username";

const generateUsername=()=>{
  const word=ANIMAL[Math.floor(Math.random()*ANIMAL.length)];
  return `anonymous-${word}-${nanoid(5)}`
}

export const useUsername = () => {
    const [username,setUsername] = useState("");

    useEffect(()=>{
      const main = ()=>{
        const storedName = localStorage.getItem(STORAGE_KEY);

        if(storedName){
          setUsername(storedName);
          return;
        }

        const generatedName = generateUsername();
        localStorage.setItem(STORAGE_KEY,generatedName);
        setUsername(generatedName);
      }

      main();

    },[])

    return {username};
}