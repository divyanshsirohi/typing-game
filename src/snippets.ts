export interface CodeSnippet {
    id: string;
    language: "python" | "javascript" | "cpp" | "go";
    title: string;
    difficulty: "easy" | "medium" | "hard";
    code: string;
}

export const CODE_SNIPPETS: CodeSnippet[] = [
    // Python Snippets
    {
        id: "python-1",
        language: "python",
        title: "API Rate Limiting Decorator",
        difficulty: "medium",
        code: `def rate_limit(max_calls=100, window=3600):
    def decorator(func):
        calls = {}
        def wrapper(*args, **kwargs):
            now = time.time()
            key = f"{func.__name__}_{args[0] if args else 'default'}"
            if key not in calls:
                calls[key] = []
            calls[key] = [call for call in calls[key] if now - call < window]
            if len(calls[key]) >= max_calls:
                raise Exception("Rate limit exceeded")
            calls[key].append(now)
            return func(*args, **kwargs)
        return wrapper
    return decorator`
    },
    {
        id: "python-2",
        language: "python",
        title: "Database Connection Pool",
        difficulty: "hard",
        code: `class DatabasePool:
    def __init__(self, min_conn=5, max_conn=20):
        self.min_conn = min_conn
        self.max_conn = max_conn
        self.pool = Queue()
        self.active_connections = 0
        self._initialize_pool()
    
    def _initialize_pool(self):
        for _ in range(self.min_conn):
            conn = self._create_connection()
            self.pool.put(conn)
            self.active_connections += 1
    
    def get_connection(self):
        try:
            return self.pool.get(timeout=5)
        except Empty:
            if self.active_connections < self.max_conn:
                return self._create_connection()
            raise Exception("Connection pool exhausted")
    
    def return_connection(self, conn):
        if conn.is_alive():
            self.pool.put(conn)
        else:
            self.active_connections -= 1`
    },
    {
        id: "python-3",
        language: "python",
        title: "Redis Cache Manager",
        difficulty: "easy",
        code: `class CacheManager:
    def __init__(self, redis_client, default_ttl=3600):
        self.client = redis_client
        self.default_ttl = default_ttl
    
    def get(self, key):
        value = self.client.get(key)
        return json.loads(value) if value else None
    
    def set(self, key, value, ttl=None):
        serialized = json.dumps(value)
        self.client.setex(key, ttl or self.default_ttl, serialized)
    
    def invalidate(self, pattern):
        keys = self.client.keys(pattern)
        if keys:
            self.client.delete(*keys)
    
    def get_or_set(self, key, callback, ttl=None):
        value = self.get(key)
        if value is None:
            value = callback()
            self.set(key, value, ttl)
        return value`
    },
    {
        id: "python-4",
        language: "python",
        title: "Async Task Processor",
        difficulty: "medium",
        code: `async def process_tasks_batch(tasks, batch_size=10):
    results = []
    for i in range(0, len(tasks), batch_size):
        batch = tasks[i:i + batch_size]
        batch_results = await asyncio.gather(*[
            process_single_task(task) for task in batch
        ], return_exceptions=True)
        results.extend(batch_results)
    return results

async def process_single_task(task):
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(task.url, json=task.data) as response:
                return await response.json()
        except Exception as e:
            logger.error(f"Task {task.id} failed: {e}")
            return {"error": str(e)}`
    },

    // JavaScript Snippets
    {
        id: "js-1",
        language: "javascript",
        title: "Middleware Pipeline",
        difficulty: "medium",
        code: `class MiddlewarePipeline {
  constructor() {
    this.middlewares = [];
  }

  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  async execute(context) {
    let index = 0;
    
    const next = async () => {
      if (index >= this.middlewares.length) return;
      const middleware = this.middlewares[index++];
      await middleware(context, next);
    };

    await next();
    return context;
  }
}

const pipeline = new MiddlewarePipeline()
  .use(async (ctx, next) => {
    ctx.startTime = Date.now();
    await next();
    ctx.duration = Date.now() - ctx.startTime;
  })
  .use(async (ctx, next) => {
    if (!ctx.user) throw new Error('Unauthorized');
    await next();
  });`
    },
    {
        id: "js-2",
        language: "javascript",
        title: "Event-Driven Architecture",
        difficulty: "hard",
        code: `class EventBus {
  constructor() {
    this.listeners = new Map();
    this.middleware = [];
  }

  subscribe(event, handler, options = {}) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    const wrappedHandler = {
      handler,
      once: options.once || false,
      priority: options.priority || 0
    };
    
    this.listeners.get(event).add(wrappedHandler);
  }

  async publish(event, data) {
    const handlers = this.listeners.get(event) || new Set();
    const sortedHandlers = Array.from(handlers)
      .sort((a, b) => b.priority - a.priority);

    for (const { handler, once } of sortedHandlers) {
      try {
        await handler(data);
        if (once) handlers.delete({ handler, once });
      } catch (error) {
        console.error('Event handler failed:', error);
      }
    }
  }
}`
    },
    {
        id: "js-3",
        language: "javascript",
        title: "API Response Cache",
        difficulty: "easy",
        code: `class APICache {
  constructor(ttl = 300000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => \`\${key}=\${params[key]}\`)
      .join('&');
    return \`\${url}?\${sortedParams}\`;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl
    });
  }

  clear() {
    this.cache.clear();
  }
}`
    },
    {
        id: "js-4",
        language: "javascript",
        title: "Webhook Handler",
        difficulty: "medium",
        code: `const validateWebhook = (secret) => {
  return (req, res, next) => {
    const signature = req.headers['x-signature'];
    const body = JSON.stringify(req.body);
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    
    if (signature !== \`sha256=\${expectedSig}\`) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    next();
  };
};

const processWebhook = async (req, res) => {
  const { event, data } = req.body;
  
  try {
    switch (event) {
      case 'payment.completed':
        await handlePaymentCompleted(data);
        break;
      case 'user.created':
        await handleUserCreated(data);
        break;
      default:
        console.log(\`Unknown event: \${event}\`);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
};`
    },

    // C++ Snippets
    {
        id: "cpp-1",
        language: "cpp",
        title: "Thread-Safe Object Pool",
        difficulty: "hard",
        code: `template<typename T>
class ObjectPool {
private:
    std::queue<std::unique_ptr<T>> objects;
    std::mutex mutex;
    std::condition_variable condition;
    std::function<std::unique_ptr<T>()> factory;
    size_t maxSize;
    
public:
    ObjectPool(std::function<std::unique_ptr<T>()> f, size_t max = 100) 
        : factory(f), maxSize(max) {}
    
    std::unique_ptr<T> acquire() {
        std::unique_lock<std::mutex> lock(mutex);
        
        if (objects.empty()) {
            return factory();
        }
        
        auto obj = std::move(objects.front());
        objects.pop();
        return obj;
    }
    
    void release(std::unique_ptr<T> obj) {
        std::lock_guard<std::mutex> lock(mutex);
        if (objects.size() < maxSize) {
            objects.push(std::move(obj));
            condition.notify_one();
        }
    }
};`
    },
    {
        id: "cpp-2",
        language: "cpp",
        title: "Memory Pool Allocator",
        difficulty: "hard",
        code: `class MemoryPool {
private:
    char* memory;
    size_t blockSize;
    size_t blockCount;
    std::stack<void*> freeBlocks;
    std::mutex mutex;
    
public:
    MemoryPool(size_t blockSize, size_t blockCount) 
        : blockSize(blockSize), blockCount(blockCount) {
        memory = static_cast<char*>(malloc(blockSize * blockCount));
        
        for (size_t i = 0; i < blockCount; ++i) {
            freeBlocks.push(memory + i * blockSize);
        }
    }
    
    void* allocate() {
        std::lock_guard<std::mutex> lock(mutex);
        if (freeBlocks.empty()) {
            throw std::bad_alloc();
        }
        
        void* block = freeBlocks.top();
        freeBlocks.pop();
        return block;
    }
    
    void deallocate(void* ptr) {
        std::lock_guard<std::mutex> lock(mutex);
        freeBlocks.push(ptr);
    }
    
    ~MemoryPool() {
        free(memory);
    }
};`
    },
    {
        id: "cpp-3",
        language: "cpp",
        title: "HTTP Response Parser",
        difficulty: "medium",
        code: `struct HttpResponse {
    int statusCode;
    std::map<std::string, std::string> headers;
    std::string body;
};

class HttpParser {
public:
    static HttpResponse parse(const std::string& response) {
        HttpResponse result;
        std::istringstream stream(response);
        std::string line;
        
        if (std::getline(stream, line)) {
            result.statusCode = parseStatusCode(line);
        }
        
        while (std::getline(stream, line) && !line.empty()) {
            if (line.back() == '\r') line.pop_back();
            
            size_t colonPos = line.find(':');
            if (colonPos != std::string::npos) {
                std::string key = line.substr(0, colonPos);
                std::string value = line.substr(colonPos + 2);
                result.headers[key] = value;
            }
        }
        
        std::string bodyLine;
        while (std::getline(stream, bodyLine)) {
            result.body += bodyLine + "\n";
        }
        
        return result;
    }
    
private:
    static int parseStatusCode(const std::string& statusLine) {
        size_t start = statusLine.find(' ') + 1;
        size_t end = statusLine.find(' ', start);
        return std::stoi(statusLine.substr(start, end - start));
    }
};`
    },
    {
        id: "cpp-4",
        language: "cpp",
        title: "JSON Token Parser",
        difficulty: "easy",
        code: `enum class TokenType {
    OBJECT_START, OBJECT_END,
    ARRAY_START, ARRAY_END,
    STRING, NUMBER, BOOLEAN,
    NULL_VALUE, COMMA, COLON
};

struct Token {
    TokenType type;
    std::string value;
};

class JsonTokenizer {
private:
    std::string input;
    size_t position;
    
public:
    JsonTokenizer(const std::string& json) : input(json), position(0) {}
    
    Token nextToken() {
        skipWhitespace();
        
        if (position >= input.length()) {
            return {TokenType::NULL_VALUE, ""};
        }
        
        char current = input[position];
        
        switch (current) {
            case '{': position++; return {TokenType::OBJECT_START, "{"};
            case '}': position++; return {TokenType::OBJECT_END, "}"};
            case '[': position++; return {TokenType::ARRAY_START, "["};
            case ']': position++; return {TokenType::ARRAY_END, "]"};
            case ',': position++; return {TokenType::COMMA, ","};
            case ':': position++; return {TokenType::COLON, ":"};
            case '"': return parseString();
            default:
                if (isdigit(current) || current == '-') {
                    return parseNumber();
                }
                return parseKeyword();
        }
    }
    
private:
    void skipWhitespace() {
        while (position < input.length() && 
               isspace(input[position])) {
            position++;
        }
    }
};`
    },

    // Go Snippets
    {
        id: "go-1",
        language: "go",
        title: "Circuit Breaker Pattern",
        difficulty: "hard",
        code: `type CircuitBreaker struct {
    mu          sync.RWMutex
    state       State
    failures    int
    lastFailure time.Time
    threshold   int
    timeout     time.Duration
}

type State int

const (
    Closed State = iota
    Open
    HalfOpen
)

func NewCircuitBreaker(threshold int, timeout time.Duration) *CircuitBreaker {
    return &CircuitBreaker{
        threshold: threshold,
        timeout:   timeout,
        state:     Closed,
    }
}

func (cb *CircuitBreaker) Call(fn func() error) error {
    cb.mu.Lock()
    defer cb.mu.Unlock()

    if cb.state == Open {
        if time.Since(cb.lastFailure) > cb.timeout {
            cb.state = HalfOpen
            cb.failures = 0
        } else {
            return errors.New("circuit breaker is open")
        }
    }

    err := fn()
    if err != nil {
        cb.failures++
        cb.lastFailure = time.Now()
        if cb.failures >= cb.threshold {
            cb.state = Open
        }
        return err
    }

    if cb.state == HalfOpen {
        cb.state = Closed
    }
    cb.failures = 0
    return nil
}`
    },
    {
        id: "go-2",
        language: "go",
        title: "Background Job Processor",
        difficulty: "medium",
        code: `type JobProcessor struct {
    jobs     chan Job
    workers  int
    quit     chan bool
    wg       sync.WaitGroup
}

type Job struct {
    ID      string
    Type    string
    Payload map[string]interface{}
}

func NewJobProcessor(workers int) *JobProcessor {
    return &JobProcessor{
        jobs:    make(chan Job, 100),
        workers: workers,
        quit:    make(chan bool),
    }
}

func (jp *JobProcessor) Start() {
    for i := 0; i < jp.workers; i++ {
        jp.wg.Add(1)
        go jp.worker(i)
    }
}

func (jp *JobProcessor) worker(id int) {
    defer jp.wg.Done()
    
    for {
        select {
        case job := <-jp.jobs:
            if err := jp.processJob(job); err != nil {
                log.Printf("Worker %d failed to process job %s: %v", 
                    id, job.ID, err)
            }
        case <-jp.quit:
            return
        }
    }
}

func (jp *JobProcessor) AddJob(job Job) {
    jp.jobs <- job
}

func (jp *JobProcessor) Stop() {
    close(jp.quit)
    jp.wg.Wait()
}`
    },
    {
        id: "go-3",
        language: "go",
        title: "Rate Limiter with Buckets",
        difficulty: "medium",
        code: `type RateLimiter struct {
    mu       sync.Mutex
    buckets  map[string]*TokenBucket
    rate     int
    capacity int
}

type TokenBucket struct {
    tokens    int
    lastRefill time.Time
    rate      int
    capacity  int
}

func NewRateLimiter(rate, capacity int) *RateLimiter {
    return &RateLimiter{
        buckets:  make(map[string]*TokenBucket),
        rate:     rate,
        capacity: capacity,
    }
}

func (rl *RateLimiter) Allow(key string) bool {
    rl.mu.Lock()
    defer rl.mu.Unlock()

    bucket, exists := rl.buckets[key]
    if !exists {
        bucket = &TokenBucket{
            tokens:     rl.capacity,
            lastRefill: time.Now(),
            rate:       rl.rate,
            capacity:   rl.capacity,
        }
        rl.buckets[key] = bucket
    }

    now := time.Now()
    elapsed := now.Sub(bucket.lastRefill).Seconds()
    tokensToAdd := int(elapsed) * bucket.rate
    
    bucket.tokens = min(bucket.capacity, bucket.tokens+tokensToAdd)
    bucket.lastRefill = now

    if bucket.tokens > 0 {
        bucket.tokens--
        return true
    }
    return false
}`
    },
    {
        id: "go-4",
        language: "go",
        title: "Database Connection Pool",
        difficulty: "easy",
        code: `type ConnectionPool struct {
    connections chan *sql.DB
    maxConn     int
    connString  string
    mu          sync.Mutex
}

func NewConnectionPool(connString string, maxConn int) *ConnectionPool {
    pool := &ConnectionPool{
        connections: make(chan *sql.DB, maxConn),
        maxConn:     maxConn,
        connString:  connString,
    }
    
    for i := 0; i < maxConn; i++ {
        conn, err := sql.Open("postgres", connString)
        if err != nil {
            panic(err)
        }
        pool.connections <- conn
    }
    
    return pool
}

func (p *ConnectionPool) GetConnection() (*sql.DB, error) {
    select {
    case conn := <-p.connections:
        if err := conn.Ping(); err != nil {
            newConn, err := sql.Open("postgres", p.connString)
            if err != nil {
                return nil, err
            }
            return newConn, nil
        }
        return conn, nil
    case <-time.After(5 * time.Second):
        return nil, errors.New("connection timeout")
    }
}

func (p *ConnectionPool) ReturnConnection(conn *sql.DB) {
    select {
    case p.connections <- conn:
    default:
        conn.Close()
    }
}`
    }
];