// Template examples for demonstration
export const codeTemplates = [
    {
        id: 1,
        name: "Button Component",
        code: `function Button({ children, variant = "primary", onClick }) {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };
  
  return (
    <button
      className={\`\${baseClasses} \${variants[variant]}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function App() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Button Examples</h1>
      <div className="space-x-4">
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="danger">Danger Button</Button>
      </div>
    </div>
  );
}`
    },
    {
        id: 2,
        name: "Card Component",
        code: `function Card({ title, description, image, buttonText }) {
  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white">
      {image && (
        <img className="w-full h-48 object-cover" src={image} alt={title} />
      )}
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{title}</div>
        <p className="text-gray-700 text-base">{description}</p>
      </div>
      <div className="px-6 pt-4 pb-2">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          {buttonText}
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Card Example</h1>
      <Card 
        title="Beautiful Card"
        description="This is a beautiful card component with Tailwind CSS styling."
        image="https://via.placeholder.com/400x200"
        buttonText="Learn More"
      />
    </div>
  );
}`
    },
    {
        id: 3,
        name: "Todo List",
        code: `function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([...tasks, { text: input, done: false }]);
    setInput("");
  };

  const toggleTask = (i) => {
    const updated = [...tasks];
    updated[i].done = !updated[i].done;
    setTasks(updated);
  };

  const deleteTask = (i) => {
    setTasks(tasks.filter((_, idx) => idx !== i));
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold mb-4 text-center">Todo List</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Add a task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={addTask}
          className="bg-black text-white px-4 py-2 rounded-md hover:opacity-90"
        >
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {tasks.map((task, i) => (
          <li
            key={i}
            className="flex justify-between items-center p-2 border-b border-gray-200"
          >
            <span
              onClick={() => toggleTask(i)}
              className={\`flex-1 cursor-pointer \${task.done ? "line-through text-gray-400" : ""}\`}
            >
              {task.text}
            </span>
            <button
              onClick={() => deleteTask(i)}
              className="text-red-500 font-bold px-2 hover:text-red-700"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">Todo List Example</h1>
      <TodoList />
    </div>
  );
}`
    }
];

export const defaultCode = `function App() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to AI Code Generator</h1>
      <p className="text-gray-600 mb-6">Ask me to create any React component!</p>
      <div className="bg-blue-50 p-6 rounded-lg">
        <p className="text-blue-800">Try asking for:</p>
        <ul className="text-blue-700 mt-2 space-y-1">
          <li>• "Create a login form"</li>
          <li>• "Build a product card"</li>
          <li>• "Make a navigation bar"</li>
        </ul>
      </div>
    </div>
  );
}`

