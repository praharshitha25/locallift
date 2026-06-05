import { useState } from "react";

const SafeImage = ({ src, alt = "", className = "", fallbackSrc = "", placeholder = null, ...props }) => {
    const [failed, setFailed] = useState(false);
    const imageSrc = !failed && src ? src : fallbackSrc;

    if (!imageSrc) {
        return placeholder || <div className={className} {...props} />;
    }

    return (
        <img
            src={imageSrc}
            alt={alt}
            className={className}
            onError={() => setFailed(true)}
            {...props}
        />
    );
};

export default SafeImage;
