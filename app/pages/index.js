import backgroundImage from '../public/background.jpg';

export default function Home() {
  return (
    <div className="bg-cover h-screen w-screen flex justify-center items-center just" style={{ backgroundImage: `url(${backgroundImage.src})`, height: "100vh" }}>
    <div className=" bg-zinc-800 backdrop-blur-sm bg-opacity-60 rounded-3xl w-3/4 h-fit p-8">
          <h1 className="text-4xl font-bold mb-4 text-white">Welcome to SoulDao</h1>
          <button className="px-4 py-2 bg-gray-800 text-white rounded-md">
            Enter
          </button>
        </div>
  </div>
  )
}
