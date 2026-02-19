# FIX Barbearia - Documentação da Arquitetura

## Visão Geral

FIX Barbearia é um website profissional e modular desenvolvido com React + Vite + TypeScript + TailwindCSS. A arquitetura foi projetada para ser escalável, mantível e preparada para integração com backend REST.

## Estrutura de Pastas

```
src/
├── components/        # Componentes reutilizáveis
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── ServiceCard.tsx
│   ├── ServiceGrid.tsx
│   ├── ServiceModal.tsx
│   ├── CartDrawer.tsx
│   └── Footer.tsx
├── pages/            # Páginas/Layouts
│   └── Home.tsx
├── context/          # Context API para estado global
│   ├── ThemeContext.tsx
│   └── CartContext.tsx
├── hooks/            # Custom hooks (preparado para futura expansão)
├── utils/            # Funções utilitárias
│   └── validation.ts
├── data/             # Dados mockados
│   └── services.ts
├── types/            # Definições TypeScript
│   └── index.ts
├── assets/           # Ícones, imagens
│   └── icons/
├── App.tsx
├── main.tsx
└── index.css
```

## Componentes

### Header.tsx
- Navegação fixa com links suave (smooth scroll)
- Toggle tema dark/light
- Carrinho com contador
- Menu responsivo mobile
- Logo interativa

### Hero.tsx
- Seção inicial com chamada à ação
- Botões para WhatsApp e visualização de serviços
- Design atrativo com gradiente

### ServiceCard.tsx
- Card reutilizável para cada serviço
- Exibe duração, preço e descrição
- Integrado com modal de detalhes

### ServiceGrid.tsx
- Grid responsivo de serviços
- 1 coluna mobile, 2 tablets, 3 desktop

### ServiceModal.tsx
- Modal com detalhes completos do serviço
- Botão "Adicionar ao Carrinho"
- Sem navegação entre páginas (SPA)
- Overlay com close automático

### CartDrawer.tsx
- Drawer lateral com carrinho
- Funcionalidades:
  - Adicionar/remover itens
  - Alterar quantidade
  - Seletor de data com validação
  - Seletor de horário
  - Opções de pagamento (online/presencial)
  - Observações opcionais
  - Validação de formulário completa
  - Feedback visual de sucesso

### Header + Footer
- Informações de contato
- Links sociais
- Horários de funcionamento

## Context API

### ThemeContext
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```
- Gerencia tema global
- Persiste em localStorage
- Respeita preferência do sistema

### CartContext
```typescript
interface CartContextType {
  items: CartItem[];
  addItem: (serviceId, serviceName, price) => void;
  removeItem: (serviceId) => void;
  updateQuantity: (serviceId, quantity) => void;
  getTotal: () => number;
  getCartCount: () => number;
  clearCart: () => void;
  createOrder: (booking) => Order | null;
  getOrders: () => Order[];
}
```
- Gerencia carrinho de serviços
- Cria pedidos com dados de agendamento
- Persiste carrinho e pedidos em localStorage
- Validação integrada

## Tipos (Types)

```typescript
// Serviço disponível
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  category: 'haircut' | 'beard' | 'shaving' | 'combo';
}

// Item no carrinho
interface CartItem {
  serviceId: string;
  quantity: number;
  serviceName: string;
  price: number;
}

// Dados de agendamento
interface BookingData {
  date: string;
  time: string;
  paymentMethod: 'online' | 'cash';
  notes?: string;
}

// Pedido criado
interface Order {
  id: string;
  items: CartItem[];
  booking: BookingData;
  total: number;
  createdAt: string;
  status: 'pending' | 'completed' | 'cancelled';
}
```

## Dados Mockados (services.ts)

```typescript
// 7 serviços pré-configurados com:
SERVICES: Service[]

// Horários de funcionamento
TIME_SLOTS: string[] // ['09:00', '09:30', ...]

// Horas comerciais
BUSINESS_HOURS: object
```

## Utilidades de Validação

### validation.ts
- `isValidDate()` - Valida datas futuras
- `isValidEmail()` - Validação de email
- `isValidPhone()` - Validação de telefone
- `sanitizeInput()` - Remove caracteres perigosos
- `sanitizeObject()` - Sanitiza objetos inteiros
- `validateBookingForm()` - Validação completa do formulário

## Fluxo de Dados

```
User seleciona serviço
  ↓
Modal abre com detalhes
  ↓
"Adicionar ao Carrinho" dispara addItem(CartContext)
  ↓
Item adicionado ao estado + localStorage
  ↓
Badge de contagem atualiza
  ↓
Drawer abre (manual ou automático)
  ↓
Preenche dados de agendamento
  ↓
Validação do formulário
  ↓
createOrder() chamado
  ↓
Order salva em localStorage
  ↓
Carrinho limpo
  ↓
Feedback visual de sucesso
```

## LocalStorage

```javascript
// Tema do usuário
localStorage.setItem('theme', 'light' | 'dark')

// Carrinho ativo
localStorage.setItem('fix_barbearia_cart', JSON.stringify(items))

// Histórico de pedidos
localStorage.setItem('fix_barbearia_orders', JSON.stringify(orders))
```

## Segurança

1. **Sanitização de Inputs**: Todos os inputs do usuário são sanitizados
2. **Validação Frontend**: Validação antes de enviar para localStorage
3. **Proteção localStorage**: Dados validados antes de JSON.parse
4. **TypeScript**: Tipagem forte previne erros
5. **Preparado para Backend**: Estrutura pronta para validação server-side

## Responsividade

- Mobile First (320px+)
- Tablet (768px+)
- Desktop (1024px+)
- Breakpoints Tailwind padrão

## Tema Dark/Light

- Toggle no header
- Persiste preferência
- Transições suaves
- Classes `dark:` do Tailwind
- Respeita `prefers-color-scheme`

## Recursos

✅ 7 serviços com imagens reais (Pexels)
✅ Sistema completo de carrinho
✅ Agendamento com data/hora
✅ Métodos de pagamento (online/presencial)
✅ Observações personalizadas
✅ Validação robusta
✅ Tema dark/light
✅ Responsivo 100%
✅ Sem navegação entre páginas (SPA)
✅ LocalStorage para persistência
✅ TypeScript em todo projeto
✅ Código limpo e comentado
✅ Preparado para backend

## Próximos Passos de Integração com Backend

1. **API REST**
   - `POST /api/services` - Listar serviços
   - `POST /api/availability` - Horários disponíveis
   - `POST /api/orders` - Criar pedido
   - `GET /api/orders/:id` - Recuperar pedido

2. **Autenticação**
   - Integrar sistema de auth
   - Salvar pedidos por usuário

3. **Pagamento Online**
   - Integrar gateway (Stripe, etc)
   - Webhook de confirmação

4. **Notificações**
   - Email ao confirmar
   - SMS com horário confirmado
   - WhatsApp automático

5. **Admin Panel**
   - Gerenciar serviços
   - Ver agendamentos
   - Confirmar pedidos

## Como Rodar

```bash
# Instalar dependências
npm install

# Rodar desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint

# Type check
npm run typecheck
```

## Stack Técnico

- **React 18.3** - UI Framework
- **Vite 5.4** - Build tool
- **TypeScript 5.5** - Type safety
- **TailwindCSS 3.4** - Styling
- **Lucide React 0.344** - Icons
- **Context API** - State management
- **localStorage** - Persistence

## Performance

- Tamanho gzip: ~54KB
- Zero dependências extras
- Otimizado para mobile
- Lazy loading de imagens
- CSS-in-JS via Tailwind

---

**Desenvolvido com ❤️ para FIX Barbearia**
