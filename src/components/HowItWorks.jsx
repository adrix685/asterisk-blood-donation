import React from 'react';

function HowItWorks() {
    return (
        <section>
            <div>
                <h2>How LifeLink Works</h2>
                <p>A seamless process designed for speed and reliability.</p>
            </div>

            <div>

                <div>
                    <div>
                        <span>🩸</span>
                        <h3>For Requesters</h3>
                    </div>

                    <ul>
                        <li>
                            <span>1</span>
                            <div>
                                <strong>Broadcast Need</strong>
                                <p>Enter blood type, location, and urgency level.</p>
                            </div>
                        </li>

                        <li>
                            <span>2</span>
                            <div>
                                <strong>Instant Matching</strong>
                                <p>System pings verified donors within a 10-mile radius.</p>
                            </div>
                        </li>

                        <li>
                            <span>3</span>
                            <div>
                                <strong>Connect & Save</strong>
                                <p>Communicate directly and coordinate hospital arrival.</p>
                            </div>
                        </li>
                    </ul>
                </div>


                <div>
                    <div>
                        <span>🛡️</span>
                        <h3>For Donors</h3>
                    </div>

                    <ul>
                        <li>
                            <span>1</span>
                            <div>
                                <strong>Get Verified</strong>
                                <p>Quick identity and medical history check to earn your badge.</p>
                            </div>
                        </li>

                        <li>
                            <span>2</span>
                            <div>
                                <strong>Receive Alerts</strong>
                                <p>Get notified only when your specific blood type is needed nearby.</p>
                            </div>
                        </li>

                        <li>
                            <span>3</span>
                            <div>
                                <strong>Respond</strong>
                                <p>Accept the request and head to the designated hospital.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
}

export default HowItWorks;