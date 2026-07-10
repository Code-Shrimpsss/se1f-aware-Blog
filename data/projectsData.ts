interface Project {
  title: string
  description: string
  href: string
  eyebrow: string
  capabilities: string[]
  status: string
}

const projectsData: Project[] = [
  {
    title: 'FastMoss',
    eyebrow: 'Product engineering',
    description: '围绕数据产品与复杂业务场景，参与从界面体验、工程实现到稳定交付的完整链路。',
    capabilities: ['Frontend architecture', 'Data experience', 'Delivery'],
    status: 'Professional work',
    href: 'https://www.fastmoss.com/',
  },
  {
    title: 'Aimy',
    eyebrow: 'AI-native product',
    description: '探索 AI 能力如何进入真实产品流程，让模型输出成为可理解、可操作、可持续迭代的体验。',
    capabilities: ['AI interaction', 'Full-stack', 'Product systems'],
    status: 'Product practice',
    href: 'mailto:se1faware24@gmail.com?subject=Aimy%20project',
  },
  {
    title: 'AI Support Agent',
    eyebrow: 'Agent delivery',
    description: '面向服务场景设计 Agent 工作流，关注检索、工具调用、状态管理、评估与人工接管。',
    capabilities: ['RAG', 'Tool use', 'Observability'],
    status: 'Engineering practice',
    href: '/blog/production-grade-agent-architecture',
  },
]

export default projectsData
