    import React from 'react';

    const ResourcesSection = () => {
    const resources = [
        {
        title: "Java Mastery",
        links: [
            { name: "HackerRank Java Track", url: "https://www.hackerrank.com/domains/java" },
            { name: "Spring Boot Official Guide", url: "https://spring.io/guides/gs/spring-boot/" }
        ]
        },
        {
        title: "MERN Stack Development",
        links: [
            { name: "React Documentation", url: "https://react.dev" },
            { name: "MongoDB University", url: "https://university.mongodb.com/" }
        ]
        },
        {
        title: "Placement Readiness",
        links: [
            { name: "Naukri Campus CodeQuest", url: "https://www.naukri.com/campus" },
            { name: "Top 50 DSA Questions", url: "https://www.geeksforgeeks.org/top-100-dsa-interview-questions/" }
        ]
        }
    ];

    return (
        <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Learning Resources</h2>
        <div className="grid md:grid-cols-3 gap-6">
            {resources.map((category, i) => (
            <div key={i} className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-3">{category.title}</h3>
                <ul className="space-y-2">
                {category.links.map((link, j) => (
                    <li key={j}>
                    <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                        <span>→</span> {link.name}
                    </a>
                    </li>
                ))}
                </ul>
            </div>
            ))}
        </div>
        </div>
    );
    };

export default ResourcesSection;