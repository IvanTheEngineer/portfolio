import { PortfolioData } from './types';

export const PORTFOLIO_DATA: PortfolioData = {
  name: "Ivan Kisselev",
  asciiArt: `
  ___                       __  __              __          
 |_ _|__   __ __ _ _ __     | |/ (_)___ ___  ___| | _____   __
  | | \\ \\ / // _\` | '_  \\   | ' /| / __/ __|/ _ \\ |/ _ \\ \\ / /
  | |  \\ V /| (_| | | | |   | . \\| \\__ \\__ \\  __/ |  __/\\ V / 
 |___|  \\_/  \\__,_|_| |_|   |_|\\_\\_|___/___/\\___|_|\\___| \\_/  
                                                           
  `,
  about: `I am a Computer Science student at the University of Virginia (Class of 2026) with a 4.0 GPA. 
I have professional experience in full-stack engineering, cloud infrastructure (AWS), and ML pipelines.
I am passionate about building scalable web applications and optimizing cloud architectures.

Contact: ivankisselev7@gmail.com
GitHub: github.com/IvanTheEngineer
LinkedIn: linkedin.com/in/ivan-kisselev-1948301b4/`,
  skills: [
    "Python", "JavaScript", "Java", "Go", "SQL", "C", "Swift",
    "React", "ViteJS", "HTML/CSS", "Django", "Bootstrap",
    "AWS (S3, SQS, SNS, Lambda, ECS, CloudFront, Route 53)",
    "Terraform", "PostgreSQL", "Git + CI/CD", "Docker", "TensorFlow", "Firebase"
  ],
  projects: [
    {
      name: "ScrollStudy",
      description: "Chrome Extension injecting study material into social media feeds using Gemini 2.5 Flash.",
      tech: ["JavaScript", "HTML/CSS", "Gemini API", "Fetch API"],
      link: "github.com/IvanTheEngineer/ScrollStudy"
    },
    {
      name: "Website-Fingerprinting",
      description: "ML pipeline analyzing packet captures to identify websites with 53% accuracy across 100 classes.",
      tech: ["Python", "TensorFlow", "Scikit-Learn", "Pandas", "PyShark", "Selenium"],
      link: "github.com/IvanTheEngineer/Website-Fingerprinting"
    }
  ],
  experience: [
    {
      role: "Software Engineer",
      company: "theCourseForum",
      period: "September 2025 - Present",
      details: [
        "Developing/maintaining a UVA course selection site with 10,000+ active users.",
        "Cut ALB spend 98% by implementing CloudFront caching behaviors.",
        "Optimized infrastructure (autoscaling, right-sizing) to reduce costs.",
        "Dockerized services on AWS ECS/RDS (PostgreSQL).",
        "Full-stack development using Django, HTML, CSS, and JavaScript."
      ]
    },
    {
      role: "Software Engineer Intern",
      company: "Fannie Mae (AI Gateway)",
      period: "June 2025 - August 2025",
      details: [
        "Raised max runtime 15x for LLM workflows using async polling/pub-sub (AWS Lambda, SQS, SNS).",
        "Led Design Forum sessions for 80+ engineers on long-running LLM workflows.",
        "Built regression test suite (Postman, GitLab CI/CD) covering 15+ scenarios.",
        "Implemented client-side rate-limiting reference implementation."
      ]
    },
    {
      role: "Software Engineer Intern",
      company: "Dominion Energy",
      period: "May 2024 - August 2024",
      details: [
        "Achieved ~95% accuracy translating substation schematics into PSS/E generation commands.",
        "Built backend & GUI integrating Python, OpenCV, and PDFMiner.",
        "Reduced modeling time by ~50% for new substation topologies.",
        "Coordinated with 10+ engineers to devise optimal solutions."
      ]
    }
  ],
  education: [
    {
      degree: "B.S. Computer Science",
      school: "University of Virginia",
      year: "August 2022 - May 2026"
    }
  ]
};